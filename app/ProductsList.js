import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

export function ProductsList() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTime, setFilterTime] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://103.249.117.201:12732/products');
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Phản hồi không phải JSON');
        }
        const data = await response.json();
        const formatted = data.map((item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          scale: item.scale,
          brand: item.brand,
          stock: item.stock,
          thumbnail: item.images?.[0],
          createdAt: item.createdAt,
          type: item.type,
        }));
        setProducts(formatted);
      } catch (error) {
        console.error('❌ Lỗi khi lấy sản phẩm:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm.');
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let list = products;
    if (filterTime !== 'all') {
      const now = new Date();
      list = list.filter((item) => {
        const created = new Date(item.createdAt);
        if (filterTime === '7d') return (now - created) / (1000 * 60 * 60 * 24) <= 7;
        if (filterTime === '30d') return (now - created) / (1000 * 60 * 60 * 24) <= 30;
        return true;
      });
    }
    if (search.trim()) {
      list = list.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredProducts(list);
  }, [products, search, filterTime]);

  function renderProduct({ item }) {
    const isPreorder = item.type === 'preorder';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.infoBox}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.price, isPreorder && { color: '#1D5D9B' }]}>
            {item.price?.toLocaleString('vi-VN')}₫
          </Text>
          <Text style={styles.brand}>{item.brand}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Danh sách sản phẩm</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#8A9AB6"
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#0A1D56',
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginTop: 40,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  searchBox: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 30,
    borderWidth: 1.2,
    borderColor: '#DCE4FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 16,
    color: '#0A1D56',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 60,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoBox: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#0A1D56',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3E62',
    marginTop: 6,
  },
  brand: {
    fontSize: 13,
    color: '#8A9AB6',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
});
