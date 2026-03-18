import { FirebaseError } from 'firebase/app';

export function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : 'Nao foi possivel concluir a autenticacao.';
  }

  switch (error.code) {
    case 'auth/operation-not-allowed':
      return 'O login por Email/Senha ainda nao esta habilitado no Firebase. Abra Firebase Console > Authentication > Sign-in method > Email/Password e ative o provedor.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou senha invalidos.';
    case 'auth/email-already-in-use':
      return 'Este email ja esta em uso.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'O email informado nao e valido.';
    case 'auth/requires-recent-login':
      return 'Por seguranca, entre novamente na conta antes de tentar trocar a senha.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas em sequencia. Aguarde alguns instantes e tente novamente.';
    default:
      return error.message || 'Nao foi possivel concluir a autenticacao.';
  }
}
