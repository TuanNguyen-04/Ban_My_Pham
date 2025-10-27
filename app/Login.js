import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `http://103.249.117.201:12732/users/search/by-username?username=${encodeURIComponent(username)}`
      );
      const data = await res.json();

      if (data && data.passwordHash) {
        if (data.passwordHash === password) {
          login(data);
          router.replace('/');
        } else {
          Alert.alert('Lỗi', 'Sai tài khoản hoặc mật khẩu.');
        }
      } else {
        Alert.alert('Lỗi', 'Sai tài khoản hoặc mật khẩu.');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể kết nối máy chủ.');
    }
    setLoading(false);
  };

  const goToRegister = () => {
    router.push('/Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>TBeauty</Text>
        <Text style={styles.subtitle}>Đăng nhập tài khoản của bạn</Text>

        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={goToRegister} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Chưa có tài khoản?{' '}
            <Text style={styles.registerHighlight}>Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1f3a', // Xanh navy đậm
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0b1f3a',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1.2,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f8f9fc',
  },
  loginButton: {
    backgroundColor: '#1c2f5d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registerLink: {
    marginTop: 22,
  },
  registerText: {
    textAlign: 'center',
    color: '#555',
  },
  registerHighlight: {
    color: '#1c2f5d',
    fontWeight: '600',
  },
});
