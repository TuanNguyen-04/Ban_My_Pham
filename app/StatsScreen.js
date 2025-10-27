import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StatsScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSample, setShowSample] = useState(false);

  const totalItemsSold = orders.reduce((sum, o) => {
    if (!Array.isArray(o.items)) return sum;
    return sum + o.items.reduce((s, i) => s + (i.quantity || 0), 0);
  }, 0);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('http://103.249.117.201:12732/deliveries');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load orders', err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu đơn hàng');
      setOrders([]);
    }
    setLoading(false);
  }

  function computeRevenue(order) {
    if (!order) return 0;
    if (typeof order.totalPrice === 'number' && !isNaN(order.totalPrice)) return order.totalPrice;
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        return sum + price * quantity;
      }, 0);
    }
    return 0;
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + computeRevenue(o), 0);
  const byStatus = orders.reduce((acc, o) => {
    const st = o.status || 'unknown';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  const salesByDay = {};
  const now = new Date();
  for (const o of orders) {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    if (!d || isNaN(d.getTime())) continue;
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) continue;
    const key = d.toISOString().slice(0, 10);
    salesByDay[key] = (salesByDay[key] || 0) + computeRevenue(o);
  }

  const recentDays = Object.keys(salesByDay).sort().slice(-15);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>📊 Thống kê đơn hàng</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0A1D56" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tổng đơn hàng</Text>
              <Text style={styles.statValue}>{totalOrders}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Sản phẩm đã bán</Text>
              <Text style={styles.statValue}>{totalItemsSold}</Text>
            </View>
          </View>

          <View style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Tổng doanh thu</Text>
            <Text style={styles.revenueValue}>
              {totalRevenue.toLocaleString('vi-VN')} ₫
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Phân loại trạng thái</Text>
            {Object.keys(byStatus).length === 0 ? (
              <Text style={styles.emptyText}>Không có đơn hàng</Text>
            ) : (
              Object.entries(byStatus).map(([k, v]) => (
                <View key={k} style={styles.row}>
                  <Text style={styles.rowKey}>{k}</Text>
                  <Text style={styles.rowValue}>{v}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Doanh thu theo ngày (15 ngày gần đây)</Text>
            {recentDays.length === 0 ? (
              <Text style={styles.emptyText}>Không có dữ liệu gần đây</Text>
            ) : (
              recentDays.map((d) => (
                <View key={d} style={styles.row}>
                  <Text style={styles.rowKey}>{d}</Text>
                  <Text style={styles.rowValue}>
                    {(salesByDay[d] || 0).toLocaleString('vi-VN')} ₫
                  </Text>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
            <Text style={styles.refreshText}>↻ Làm mới dữ liệu</Text>
          </TouchableOpacity>

          {totalRevenue === 0 && orders.length > 0 && (
            <View style={styles.debugSection}>
              <TouchableOpacity onPress={() => setShowSample((s) => !s)}>
                <Text style={styles.debugToggle}>
                  {showSample ? 'Ẩn mẫu đơn hàng' : 'Hiển thị mẫu đơn hàng (debug)'}
                </Text>
              </TouchableOpacity>
              {showSample && (
                <View style={styles.debugBox}>
                  {orders.slice(0, 3).map((o, idx) => (
                    <View key={idx} style={{ marginBottom: 10 }}>
                      <Text style={styles.debugTitle}>Order #{idx + 1}:</Text>
                      <Text
                        style={styles.debugContent}
                      >
                        {JSON.stringify(o, null, 2).slice(0, 2000)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A1D56',
    textAlign: 'center',
    marginBottom: 20,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 5,
    padding: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  statValue: {
    color: '#0A1D56',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  revenueCard: {
    backgroundColor: '#0A1D56',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginVertical: 10,
  },
  revenueLabel: {
    color: '#E0E7FF',
    fontSize: 16,
  },
  revenueValue: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#0A1D56',
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  rowKey: {
    color: '#374151',
  },
  rowValue: {
    fontWeight: '600',
    color: '#0A1D56',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 8,
  },
  refreshBtn: {
    backgroundColor: '#0A1D56',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  debugSection: {
    marginTop: 10,
  },
  debugToggle: {
    color: '#0A1D56',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  debugBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  debugTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  debugContent: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    color: '#1F2937',
  },
});
