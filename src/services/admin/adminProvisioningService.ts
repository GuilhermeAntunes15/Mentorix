import { classesRepository, studentClassRepository, studentsRepository, usersRepository } from '@/services/repositories';
import { createManagedAccount } from '@/services/auth/authService';
import type { AlunoEntity, ManagedUserProvisionInput, SharedClassDraft, TurmaEntity, UserEntity } from '@/types';

function normalizeToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function createSyncKey(prefix: string) {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function matchesManagedClass(item: TurmaEntity, target: SharedClassDraft) {
  if (target.syncKey && item.syncKey) {
    return item.syncKey === target.syncKey;
  }

  return normalizeToken(item.codigo) === normalizeToken(target.codigo) && normalizeToken(item.nome) === normalizeToken(target.nome);
}

async function ensureClassForProfessor(professorId: string, target: SharedClassDraft) {
  const classes = await classesRepository.listOrdered(professorId);
  const existing = classes.find((item) => matchesManagedClass(item, target));

  if (existing) {
    if (!existing.syncKey || !existing.managedByAdmin) {
      await classesRepository.update(existing.id, {
        syncKey: target.syncKey,
        managedByAdmin: true
      });
    }

    return existing;
  }

  return classesRepository.create(professorId, {
    nome: target.nome,
    codigo: target.codigo,
    periodo: target.periodo,
    cor: target.cor,
    descricao: target.descricao,
    syncKey: target.syncKey,
    managedByAdmin: true
  });
}

async function listProfessorUsers() {
  const professors = await usersRepository.listByRole('professor');
  return professors.sort((left, right) => left.displayName.localeCompare(right.displayName));
}

export async function provisionProfessorAccount(input: Extract<ManagedUserProvisionInput, { role: 'professor' }>) {
  return createManagedAccount({
    email: input.email,
    password: input.password,
    role: 'professor',
    displayName: input.displayName,
    professorId: ''
  });
}

export async function updateProfessorAccountProfile(input: {
  authUid: string;
  displayName: string;
}) {
  const professor = await usersRepository.getByAuthUid(input.authUid);

  if (!professor || professor.role !== 'professor') {
    throw new Error('Professor nao encontrado para atualizacao.');
  }

  await usersRepository.updateByAuthUid(input.authUid, {
    displayName: input.displayName.trim(),
    username: input.displayName.trim()
  });
}

async function createStudentMirror(professorId: string, displayName: string, email: string, syncKey: string) {
  return studentsRepository.create(professorId, {
    nome: displayName,
    email,
    telefone: '',
    responsavel: '',
    avatarUrl: '',
    observacoes: '',
    managedByAdmin: true,
    syncKey
  });
}

export async function provisionStudentAccount(input: Extract<ManagedUserProvisionInput, { role: 'aluno' }>) {
  const professors = await listProfessorUsers();

  if (!professors.length) {
    throw new Error('Cadastre ao menos um professor antes de criar acessos de aluno.');
  }

  const classDraft: SharedClassDraft = {
    ...input.classAssignment,
    syncKey: input.classAssignment.syncKey || createSyncKey('turma')
  };

  const studentSyncKey = createSyncKey('aluno');
  const createdStudents = new Map<string, AlunoEntity>();
  let primaryProfessorId = professors[0].authUid;
  let linkedStudentId = '';

  for (const professor of professors) {
    const ensuredClass = await ensureClassForProfessor(professor.authUid, classDraft);
    const createdStudent = await createStudentMirror(professor.authUid, input.displayName, input.email, studentSyncKey);
    createdStudents.set(professor.authUid, createdStudent);

    await studentClassRepository.create(professor.authUid, {
      alunoId: createdStudent.id,
      turmaId: ensuredClass.id,
      ativo: true,
      entrouEm: new Date().toISOString(),
      managedByAdmin: true
    });
  }

  if (createdStudents.has(primaryProfessorId)) {
    linkedStudentId = createdStudents.get(primaryProfessorId)?.id ?? '';
  }

  if (!linkedStudentId) {
    throw new Error('Nao foi possivel concluir o espelhamento do aluno nas turmas dos professores.');
  }

  return createManagedAccount({
    email: input.email,
    password: input.password,
    role: 'aluno',
    displayName: input.displayName,
    professorId: primaryProfessorId,
    linkedStudentId,
    studentSyncKey
  });
}
