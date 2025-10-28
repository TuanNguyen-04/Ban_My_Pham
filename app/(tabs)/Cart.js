import { useRouter } from "expo-router";
import { useContext } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { CartContext } from "../../context/CartContext";

export default function Cart() {
  const router = useRouter();
  const { items, addToCart, removeFromCart } = useContext(CartContext);

  function Totals() {
    const total = items.reduce((sum, item) => {
      let price = item?.product?.price || 0;
      if (
        item?.product?.type === "preorder" ||
        /(PreOrder)/i.test(item?.product?.name || "")
      ) {
        price = Math.floor(price / 10);
      }
      return sum + price * item.qty;
    }, 0);

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng sản phẩm:</Text>
          <Text style={styles.summaryValue}>
            {items.reduce((sum, item) => sum + item.qty, 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền:</Text>
          <Text style={styles.summaryTotal}>{total.toLocaleString()} đ</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, items.length === 0 && { opacity: 0.6 }]}
          onPress={() => router.push("/Checkout")}
          disabled={items.length === 0}
        >
          <Text style={styles.buttonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderItem({ item }) {
    let name = item?.product?.name || "Sản phẩm";
    const image = item?.product?.images?.[0] || null; // lấy ảnh đầu tiên
    let isPreorder = false;
    let price = item?.product?.price || 0;

    if (item?.product?.type === "preorder" || /\(PreOrder\)/i.test(name)) {
      isPreorder = true;
      price = Math.floor(price / 10);
      if (!/\(PreOrder\)/i.test(name)) name += " (PreOrder)";
    }

    return (
      <View style={styles.cartItem}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: "#E3E9F2" }]} />
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.price}>
            {price.toLocaleString()} đ{" "}
            {isPreorder && (
              <Text style={{ color: "#1D5D9B", fontSize: 12 }}>(PreOrder)</Text>
            )}
          </Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => removeFromCart(item.product)}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => addToCart(item.product)}
            >
              <Text style={styles.quantityButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.itemTotal}>
            {(price * item.qty).toLocaleString()} đ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Giỏ hàng của bạn</Text>

      {items.length === 0 ? (
        <View style={styles.containerEmpty}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) =>
              item?.product?._id?.toString() ||
              item?.id?.toString() ||
              index.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 130 }}
          />
          {Totals()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#0A1D56",
  },
  containerEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#1D5D9B",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginVertical: 6,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#1D5D9B",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0A1D56",
  },
  price: {
    fontSize: 14,
    color: "#1D5D9B",
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  quantityButton: {
    backgroundColor: "#E3E9F2",
    borderRadius: 8,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A1D56",
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#0A1D56",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3E62",
  },
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    borderTopWidth: 2,
    borderTopColor: "#D0D8F0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#444",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0A1D56",
  },
  summaryTotal: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1D5D9B",
  },
  checkoutButton: {
    backgroundColor: "#0A1D56",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
