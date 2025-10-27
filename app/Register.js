import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  ScrollView,
} from 'react-native';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  // --- Kiểm tra trùng username realtime ---
  useEffect(() => {
    if (!username) {
      setUsernameError('');
      return;
    }
    let cancelled = false;
    const check = setTimeout(() => {
      fetch(`http://103.249.117.201:12732/users?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (cancelled) return;
          if (username !== '' && Array.isArray(data) && data.some(u => u.username === username)) {
            setUsernameError('Tên đăng nhập đã tồn tại');
          } else {
            setUsernameError('');
          }
        })
        .catch(() => {
          if (!cancelled) setUsernameError('Không kiểm tra được tên đăng nhập');
        });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(check);
    };
  }, [username]);

  // --- Kiểm tra độ mạnh mật khẩu realtime ---
  useEffect(() => {
    if (!password) {
      setPasswordError('');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Mật khẩu phải trên 8 ký tự');
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Mật khẩu phải có ít nhất 1 chữ hoa');
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      setPasswordError('Mật khẩu phải có ký tự đặc biệt');
    } else {
      setPasswordError('');
    }
  }, [password]);

  // --- Xử lý đăng ký ---
  const handleRegister = async () => {
    setLoading(true);
    if (!username || !password || !confirmPassword || !email) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      setLoading(false);
      return;
    }
    if (usernameError || passwordError) {
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Mật khẩu không khớp');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://103.249.117.201:12732/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          passwordHash: password,
          email,
          role: 'customer',
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data._id || data.username)) {
        // Sau khi đăng ký thành công, tạo cart
        try {
          await fetch('http://103.249.117.201:12732/carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data._id || "000000000000000000000000",
              username: username,
              products: [],
              createdAt: "2025-01-01T00:00:00.000Z",
              updatedAt: "2025-01-01T00:00:00.000Z"
            })
          });
        } catch (e) {
          console.error('Không thể tạo cart cho user mới:', e);
        }
        Alert.alert('Thành công', 'Đăng ký thành công! Hãy đăng nhập.');
        router.replace('/Login');
      } else {
        setUsernameError(data.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setUsernameError('Không thể kết nối máy chủ.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>TBeauty</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          {!!usernameError && <Text style={styles.errorText}>{usernameError}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#aaa"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading || !!usernameError || !!passwordError}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Đã có tài khoản? <Text style={styles.loginHighlight}>Đăng nhập ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1f3a', // nền xanh navy đậm
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f8f9fc',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  registerButton: {
    backgroundColor: '#1c2f5d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  registerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginLink: {
    marginTop: 22,
  },
  loginText: {
    textAlign: 'center',
    color: '#555',
  },
  loginHighlight: {
    color: '#1c2f5d',
    fontWeight: '600',
  },
});
