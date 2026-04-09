import { AuthApiError } from '@supabase/supabase-js';

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof AuthApiError) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Email ou senha invalidos.';
      case 'user_not_found':
        return 'Usuario nao encontrado.';
      case 'email_not_confirmed':
        return 'Email nao confirmado.';
      case 'weak_password':
        return 'A senha precisa ter pelo menos 6 caracteres.';
      case 'user_already_exists':
        return 'Este email ja esta em uso.';
      case 'over_request_rate_limit':
        return 'Muitas tentativas em sequencia. Aguarde alguns instantes e tente novamente.';
      case 'same_password':
        return 'A nova senha deve ser diferente da senha atual.';
      case 'validation_failed':
        return 'Os dados informados nao sao validos.';
      default:
        return error.message || 'Nao foi possivel concluir a autenticacao.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Nao foi possivel concluir a autenticacao.';
}
