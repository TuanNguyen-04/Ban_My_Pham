import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    type: 'available',
    price: 0,
    brand: '',
    stock: 0,
    images: [],
  });

  const API_URL = 'http://103.249.117.201:12732/products';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchProducts();
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    try {
      await fetch(`${API_URL}/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      setEditingProduct(null);
      fetchProducts();
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm');
    }
  };

  const handleAddProduct = async () => {
    const payload = {
      ...newProduct,
      releaseDate: new Date().toISOString(),
      images: newProduct.images?.filter((url) => url?.trim()) || [],
    };
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới');
        setAddingProduct(false);
        setNewProduct({
          name: '',
          type: 'available',
          price: 0,
          brand: '',
          stock: 0,
          images: [],
        });
        fetchProducts();
      } else {
        Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemBox}>
      {editingProduct?._id === item._id ? (
        <>
          <TextInput
            value={editingProduct.name}
            onChangeText={(t) => setEditingProduct({ ...editingProduct, name: t })}
            style={styles.input}
          />
          <TextInput
            value={String(editingProduct.price)}
            onChangeText={(t) => setEditingProduct({ ...editingProduct, price: Number(t) })}
            style={styles.input}
            keyboardType="numeric"
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingProduct(null)} style={styles.cancelBtn}>
              <Text>Hủy</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setEditingProduct(item)} style={styles.editBtn}>
              <Text style={{ color: '#1976d2' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <Text style={{ color: '#e53935' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Quản lý sản phẩm</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setAddingProduct(true)}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm sản phẩm</Text>
      </TouchableOpacity>

      {addingProduct && (
        <View style={styles.itemBox}>
          <TextInput
            placeholder="Tên sản phẩm"
            value={newProduct.name}
            onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
            style={styles.input}
          />
          <TextInput
            placeholder="Loại (available / preorder)"
            value={newProduct.type}
            onChangeText={(t) => setNewProduct({ ...newProduct, type: t })}
            style={styles.input}
          />
          <TextInput
            placeholder="Giá"
            value={String(newProduct.price)}
            onChangeText={(t) => setNewProduct({ ...newProduct, price: Number(t) })}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Thương hiệu"
            value={newProduct.brand}
            onChangeText={(t) => setNewProduct({ ...newProduct, brand: t })}
            style={styles.input}
          />
          <TextInput
            placeholder="Tồn kho"
            value={String(newProduct.stock)}
            onChangeText={(t) => setNewProduct({ ...newProduct, stock: Number(t) })}
            style={styles.input}
            keyboardType="numeric"
          />

          {/* nhập 4 ảnh */}
          {[0, 1, 2, 3].map((i) => (
            <TextInput
              key={i}
              placeholder={`Ảnh ${i + 1} - URL`}
              value={newProduct.images[i] || ''}
              onChangeText={(t) => {
                const imgs = [...newProduct.images];
                imgs[i] = t;
                setNewProduct({ ...newProduct, images: imgs });
              }}
              style={styles.input}
            />
          ))}

          <View style={styles.row}>
            <TouchableOpacity onPress={handleAddProduct} style={styles.saveBtn}>
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddingProduct(false)} style={styles.cancelBtn}>
              <Text>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 16 },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 16, 
    color: '#0A1D56',
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#0A1D56',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0A1D56',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  itemBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6DAF0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6DAF0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
    color: '#0A1D56',
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0A1D56', marginBottom: 4 },
  price: { fontSize: 15, color: '#555', marginBottom: 6 },
  editBtn: {
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#0A1D56',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#e53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: '#0A1D56',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  saveText: { color: '#fff', fontWeight: '600' },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A1D56',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
});

