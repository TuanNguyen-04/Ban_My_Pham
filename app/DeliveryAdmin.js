import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function DeliveryAdmin({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("pending");
  const { role, username } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://103.249.117.201:12732/deliveries");
      const data = await res.json();
      const allOrders = Array.isArray(data) ? data : [];

      const filteredOrders =
        role === "admin"
          ? allOrders
          : allOrders.filter((o) => o.username === username);

      setOrders(filteredOrders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await fetch(
        `http://103.249.117.201:12732/deliveries/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      setModalVisible(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng");
      setModalVisible(false);
      setSelectedOrder(null);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      await fetch(`http://103.249.117.201:12732/deliveries/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      fetchOrders();
      Alert.alert("Thành công", "Đã xác nhận bạn đã nhận hàng.");
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const deleteOrder = async (orderId) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa đơn hàng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            await fetch(
              `http://103.249.117.201:12732/deliveries/${orderId}`,
              { method: "DELETE" }
            );
            fetchOrders();
          } catch {
            Alert.alert("Lỗi", "Không thể xóa đơn hàng");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Mã đơn: {item._id}</Text>

        {role === "admin" && (
          <TouchableOpacity onPress={() => openModal(item)}>
            <Ionicons
              name="create-outline"
              size={22}
              color="#fff"
              style={styles.iconOutline}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text>Người nhận: {item.address?.recipient}</Text>
      <Text>Điện thoại: {item.address?.phone}</Text>
      <Text>
        Địa chỉ: {item.address?.street}, {item.address?.district},{" "}
        {item.address?.city}
      </Text>

      <Text
        style={[
          styles.statusText,
          item.status === "delivered"
            ? styles.statusCompleted
            : item.status === "shipped"
            ? styles.statusShipping
            : styles.statusPending,
        ]}
      >
        {item.status === "pending"
          ? "Đang xử lý"
          : item.status === "shipped"
          ? "Đang giao hàng"
          : "Đã giao hàng"}
      </Text>

      <Text style={styles.boldText}>Sản phẩm:</Text>
      {Array.isArray(item.items) && item.items.length > 0 ? (
        item.items.map((p, i) => (
          <Text key={i} style={{ marginLeft: 8 }}>
            - {p.name} x {p.quantity} ({p.price} đ)
          </Text>
        ))
      ) : (
        <Text style={{ marginLeft: 8, fontStyle: "italic" }}>
          Không có sản phẩm
        </Text>
      )}

      <Text style={styles.boldText}>
        Tổng tiền: {item.totalPrice?.toLocaleString()} đ
      </Text>
      <Text>Ngày tạo: {new Date(item.createdAt).toLocaleString()}</Text>
      <Text style={styles.boldText}>
        Username người mua: {item.username || "(Không có)"}
      </Text>

      <View style={styles.buttonContainer}>
        {role !== "admin" && item.status === "shipped" && (
          <TouchableOpacity
            style={styles.receivedButton}
            onPress={() => handleConfirmReceived(item._id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.receivedText}>Đã nhận hàng</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteOrder(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4d4f" />
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách đơn hàng</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : orders.length > 0 ? (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cube-outline"
            size={64}
            color="#ccc"
            style={styles.iconOutline}
          />
          <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
        </View>
      )}

      {role === "admin" && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
              {["pending", "shipped", "delivered"].map((status) => (
                <Pressable
                  key={status}
                  style={[
                    styles.statusOption,
                    newStatus === status && styles.statusSelected,
                  ]}
                  onPress={() => setNewStatus(status)}
                >
                  <Text
                    style={{
                      color: newStatus === status ? "#fff" : "#222",
                      fontWeight: "bold",
                    }}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.modalFooter}>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={{ color: "#888", fontWeight: "bold" }}>Hủy</Text>
                </Pressable>
                <Pressable onPress={handleUpdateStatus}>
                  <Text style={{ color: "#1976d2", fontWeight: "bold" }}>
                    Lưu
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  listContainer: { padding: 16 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: "600" },
  boldText: { marginTop: 6, fontWeight: "bold" },
  iconOutline: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    padding: 4,
  },
  statusText: {
    marginVertical: 6,
    fontWeight: "600",
    padding: 5,
    borderRadius: 8,
    textAlign: "center",
  },
  statusCompleted: { backgroundColor: "#e6f7ed", color: "#34c759" },
  statusShipping: { backgroundColor: "#fff3cd", color: "#ff9500" },
  statusPending: { backgroundColor: "#f5f5f5", color: "#666" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },
  receivedButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  receivedText: { color: "#fff", fontWeight: "bold", marginLeft: 4 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f7",
    padding: 8,
    borderRadius: 8,
  },
  buttonText: { marginLeft: 5, color: "#333" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#1976d2" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: { marginTop: 16, fontSize: 16, color: "#666" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 24,
    minWidth: 260,
    elevation: 4,
  },
  modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12 },
  statusOption: {
    padding: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 8,
    borderRadius: 6,
  },
  statusSelected: { backgroundColor: "#1976d2" },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 16,
  },
});
