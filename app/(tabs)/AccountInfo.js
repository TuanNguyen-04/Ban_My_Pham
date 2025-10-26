import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function AccountInfo() {
  const { userId, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`http://103.249.117.201:12732/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        Alert.alert("Lỗi", "Không thể lấy thông tin người dùng");
      });
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin người dùng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#1976d2" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{
              uri:
                user.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.username || "Người dùng"}</Text>
            <View style={styles.roleContainer}>
              <Icon name="verified" size={14} color="#fff" />
              <Text style={styles.role}>
                {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user.username}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email || "Chưa cập nhật"}</Text>

          <Text style={styles.label}>Quyền:</Text>
          <Text style={styles.value}>
            {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
          </Text>

          {user.phone && (
            <>
              <Text style={styles.label}>Số điện thoại:</Text>
              <Text style={styles.value}>{user.phone}</Text>
            </>
          )}

          {user.address && (
            <>
              <Text style={styles.label}>Địa chỉ:</Text>
              <Text style={styles.value}>{user.address}</Text>
            </>
          )}

          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.value}>
            {new Date(user.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#1976d2" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.version}>
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    backgroundColor: "#1976d2",
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  role: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: -20,
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1976d2",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    elevation: 2,
  },
  logoutText: {
    color: "#1976d2",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  version: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    color: "#1976d2",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
