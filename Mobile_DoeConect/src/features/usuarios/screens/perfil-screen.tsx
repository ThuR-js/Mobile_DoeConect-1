import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useRouter } from 'expo-router';
import { usuarioService } from '@/features/usuarios/services/usuario-service';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import type { ApiError } from '@/types';

export default function PerfilScreen() {
  const { usuario, signOut, updateUsuario } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { width } = useResponsive();
  const router = useRouter();

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome ?? '');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isSavingSenha, setIsSavingSenha] = useState(false);
  const [senhaError, setSenhaError] = useState<string | null>(null);

  async function handleSalvar() {
    if (!usuario) return;
    setIsSaving(true);
    setError(null);
    try {
      await usuarioService.atualizar(usuario.id, { nome });
      updateUsuario({ nome });
      setEditando(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAlterarSenha() {
    if (!usuario) return;
    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaError('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    setIsSavingSenha(true);
    setSenhaError(null);
    try {
      await usuarioService.alterarSenha(usuario.id, { senhaAtual, novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    } catch (err) {
      const apiError = err as ApiError;
      setSenhaError(apiError.message ?? 'Erro ao alterar senha.');
    } finally {
      setIsSavingSenha(false);
    }
  }

  async function handleExcluir() {
    if (!usuario) return;
    const confirmar = Platform.OS === 'web'
      ? window.confirm('ATENÇÃO: Esta ação é IRREVERSÍVEL! Todos os seus dados serão deletados permanentemente. Confirmar?')
      : await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Excluir conta',
            'Esta ação é irreversível! Todos os seus dados serão deletados permanentemente.',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Excluir', style: 'destructive', onPress: () => resolve(true) },
            ]
          )
        );
    if (!confirmar) return;
    try {
      await usuarioService.deletar(usuario.id);
      await signOut();
      router.replace('/login');
    } catch (err) {
      const apiError = err as ApiError;
      Alert.alert('Erro', apiError.message ?? 'Não foi possível excluir a conta.');
    }
  }

  async function handleInativar() {
    if (!usuario) return;
    const confirmar = Platform.OS === 'web'
      ? window.confirm('Tem certeza que deseja inativar sua conta? Você não conseguirá mais acessar o app.')
      : await new Promise<boolean>((resolve) =>
          Alert.alert(
            'Inativar conta',
            'Tem certeza? Você não conseguirá mais acessar o app.',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Inativar', style: 'destructive', onPress: () => resolve(true) },
            ]
          )
        );
    if (!confirmar) return;
    try {
      await usuarioService.inativar(usuario.id);
      await signOut();
      router.replace('/login');
    } catch (err) {
      const apiError = err as ApiError;
      Alert.alert('Erro', apiError.message ?? 'Não foi possível inativar a conta.');
    }
  }

  async function handleLogout() {
    const confirmar = Platform.OS === 'web'
      ? window.confirm('Deseja encerrar a sessão?')
      : await new Promise<boolean>((resolve) =>
          Alert.alert('Sair', 'Deseja encerrar a sessão?', [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Sair', style: 'destructive', onPress: () => resolve(true) },
          ])
        );
    if (!confirmar) return;
    await signOut();
    router.replace('/login');
  }

  if (!usuario) return null;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Avatar */}
      <ThemedView style={styles.avatar}>
        {usuario.foto ? (
          <Image source={{ uri: usuario.foto }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-outline" size={48} color="#5C3317" />
        )}
      </ThemedView>

      <ThemedText style={[styles.nome, { fontSize: width * 0.055 }]}>{usuario.nome}</ThemedText>
      <ThemedText style={styles.email}>{usuario.email}</ThemedText>
      <ThemedView style={styles.badge}>
        <ThemedText style={styles.badgeText}>{usuario.nivelAcesso ?? usuario.role}</ThemedText>
      </ThemedView>
      {usuario.dataCadastro && (
        <ThemedText style={styles.dataCadastro}>
          Membro desde {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </ThemedText>
      )}

      {error && (
        <View style={styles.errorBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="alert-circle-outline" size={16} color="#c0392b" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        </View>
      )}

      {/* Editar perfil */}
      {editando ? (
        <ThemedView style={styles.form}>
          <ThemedText style={styles.label}>Nome</ThemedText>
          <TextInput
            style={[styles.input, { fontSize: width * 0.038 }]}
            value={nome}
            onChangeText={setNome}
            editable={!isSaving}
          />

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecundario]}
              onPress={() => setEditando(false)}
              disabled={isSaving}>
              <ThemedText style={{ fontWeight: '600' }}>Cancelar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimario, isSaving && { opacity: 0.6 }]}
              onPress={handleSalvar}
              disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Salvar</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      ) : (
        <TouchableOpacity style={[styles.btn, styles.btnPrimario, { marginTop: 24, width: '100%' }]} onPress={() => setEditando(true)}>
          <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Editar perfil</ThemedText>
        </TouchableOpacity>
      )}

      {/* Alterar senha */}
      <ThemedView style={styles.senhaBox}>
        <ThemedText style={styles.senhaTitle}>Alterar senha</ThemedText>

        {senhaError && (
          <View style={[styles.errorBox, { marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="alert-circle-outline" size={16} color="#c0392b" />
              <ThemedText style={styles.errorText}>{senhaError}</ThemedText>
            </View>
          </View>
        )}

        <ThemedText style={styles.label}>Senha atual</ThemedText>
        <TextInput
          style={[styles.input, { fontSize: width * 0.038 }]}
          value={senhaAtual}
          onChangeText={setSenhaAtual}
          secureTextEntry
          editable={!isSavingSenha}
          placeholder="••••••••"
        />
        <ThemedText style={styles.label}>Nova senha</ThemedText>
        <TextInput
          style={[styles.input, { fontSize: width * 0.038 }]}
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
          editable={!isSavingSenha}
          placeholder="••••••••"
        />
        <ThemedText style={styles.label}>Confirmar nova senha</ThemedText>
        <TextInput
          style={[styles.input, { fontSize: width * 0.038 }]}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          editable={!isSavingSenha}
          placeholder="••••••••"
        />
        <TouchableOpacity
          style={[styles.btnSenha, styles.btnPrimario, isSavingSenha && { opacity: 0.6 }]}
          onPress={handleAlterarSenha}
          disabled={isSavingSenha}>
          {isSavingSenha ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Salvar nova senha</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>

      {/* Tema */}
      <ThemedView style={styles.themeRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons
            name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color="#5C3317"
          />
          <ThemedText style={{ fontWeight: '600', fontSize: 15 }}>
            {theme === 'dark' ? 'Modo escuro' : 'Modo claro'}
          </ThemedText>
        </View>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: '#ccc', true: '#5C3317' }}
          thumbColor={theme === 'dark' ? '#fff' : '#5C3317'}
        />
      </ThemedView>

      <TouchableOpacity style={[styles.btn, styles.btnLogout]} onPress={handleLogout}>
        <ThemedText style={{ color: '#c0392b', fontWeight: '600' }}>Sair da conta</ThemedText>
      </TouchableOpacity>

      {/* Zona de Perigo */}
      <ThemedView style={styles.zonaPerigo}>
        <View style={styles.zonaPerigoHeader}>
          <Ionicons name="warning-outline" size={18} color="#c0392b" />
          <ThemedText style={styles.zonaPerigoTitulo}>Zona de Perigo</ThemedText>
        </View>
        <ThemedText style={styles.zonaPerigoDesc}>
          Inativar sua conta impede o acesso ao app. Esta ação pode ser revertida pelo administrador.
        </ThemedText>
        <TouchableOpacity style={styles.btnInativar} onPress={handleInativar}>
          <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Inativar minha conta</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnInativar, { backgroundColor: '#8B0000', marginTop: 8 }]} onPress={handleExcluir}>
          <ThemedText style={{ color: '#fff', fontWeight: '700' }}>Excluir minha conta permanentemente</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, alignItems: 'center', gap: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#5C3317',
    overflow: 'hidden',
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  nome: { fontWeight: 'bold', textAlign: 'center' },
  email: { opacity: 0.6, fontSize: 14 },
  badge: {
    backgroundColor: '#5C3317',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 4,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dataCadastro: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  form: { width: '100%', gap: 4, marginTop: 16 },
  label: { fontSize: 13, fontWeight: '600', opacity: 0.7, marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(92,51,23,0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnSenha: { alignSelf: 'stretch', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  btnPrimario: { backgroundColor: '#5C3317' },
  btnSecundario: { borderWidth: 1.5, borderColor: '#5C3317' },
  btnLogout: { borderWidth: 1.5, borderColor: '#c0392b', width: '100%', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  zonaPerigo: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#c0392b',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  zonaPerigoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  zonaPerigoTitulo: { fontWeight: '700', fontSize: 15, color: '#c0392b' },
  zonaPerigoDesc: { fontSize: 13, opacity: 0.7, lineHeight: 18 },
  btnInativar: {
    backgroundColor: '#c0392b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(220,53,69,0.1)',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.3)',
  },
  errorText: { color: '#c0392b', fontSize: 13 },
  senhaBox: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(92,51,23,0.25)',
    borderRadius: 10,
    padding: 16,
    marginTop: 24,
    gap: 2,
  },
  senhaTitle: { fontWeight: '700', fontSize: 15, marginBottom: 12 },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(92,51,23,0.25)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },
});
