import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
            placeholder="Tên sản phẩm"
            placeholderTextColor="#999"
          />
          <TextInput
            value={String(editingProduct.price)}
            onChangeText={(t) => setEditingProduct({ ...editingProduct, price: Number(t) })}
            style={styles.input}
            keyboardType="numeric"
            placeholder="Giá"
            placeholderTextColor="#999"
          />
          <View style={styles.row}>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingProduct(null)} style={styles.cancelBtn}>
              <Text style={{ color: '#0A1D56', fontWeight: '600' }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {item.images && item.images[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="cover" />
          ) : null}
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setEditingProduct(item)} style={styles.editBtn}>
              <Text style={{ color: '#0A1D56', fontWeight: '600' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <Text style={{ color: '#e53935', fontWeight: '600' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Text style={styles.title}>Quản lý sản phẩm</Text>

        <TouchableOpacity style={styles.addBtn} onPress={() => setAddingProduct(true)}>
          <Text style={styles.addText}>+ Thêm sản phẩm</Text>
        </TouchableOpacity>

        {addingProduct && (
          <View style={styles.itemBox}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 500 }}
            >
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

              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <TextInput
                    placeholder={`Ảnh ${i + 1} - URL`}
                    value={newProduct.images[i] || ''}
                    onChangeText={(t) => {
                      const imgs = [...newProduct.images];
                      imgs[i] = t;
                      setNewProduct({ ...newProduct, images: imgs });
                    }}
                    style={styles.input}
                  />
                  {newProduct.images[i] ? (
                    <Image
                      source={{ uri: newProduct.images[i] }}
                      style={{ width: '100%', height: 120, borderRadius: 10, marginTop: 4 }}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
              ))}

              <View style={styles.row}>
                <TouchableOpacity onPress={handleAddProduct} style={styles.saveBtn}>
                  <Text style={styles.saveText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAddingProduct(false)} style={styles.cancelBtn}>
                  <Text style={{ color: '#0A1D56', fontWeight: '600' }}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}

        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          scrollEnabled={false}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 16 },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#0A1D56',
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#0A1D56',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0A1D56',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  itemBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D6DAF0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
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
  name: { fontSize: 16, fontWeight: 'bold', color: '#0A1D56', marginBottom: 6, textAlign: 'center' },
  price: { fontSize: 15, color: '#555', marginBottom: 6, textAlign: 'center' },
  editBtn: {
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#0A1D56',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#e53935',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: '#0A1D56',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0A1D56',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },
});
