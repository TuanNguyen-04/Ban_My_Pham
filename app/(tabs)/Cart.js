import { useRouter } from "expo-router";
import { useContext } from "react";
import {
  Button,
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
          <Text style={styles.summaryLabel}>Tổng số sản phẩm:</Text>
          <Text style={styles.summaryValue}>
            {items.reduce((sum, item) => sum + item.qty, 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền:</Text>
          <Text style={styles.summaryTotal}>{total.toLocaleString()} đ</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push("/Checkout")}
            disabled={items.length === 0}
          >
            <Text style={styles.buttonText}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderItem({ item }) {
    let name = item?.product?.name || "Sản phẩm";
    const image = item?.product?.image || item?.product?.img || null;
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
          <View style={[styles.image, { backgroundColor: "#eee" }]} />
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.price}>
            {price.toLocaleString()} đ{" "}
            {isPreorder && (
              <Text style={{ color: "#d2691e", fontSize: 12 }}>(PreOrder)</Text>
            )}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => removeFromCart(item.product)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => addToCart(item.product)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
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
      <Text style={styles.header}>Giỏ hàng của bạn</Text>
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
            contentContainerStyle={{ paddingBottom: 150 }}
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
    backgroundColor: "#fffdf8",
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#d2691e",
  },
  containerEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#d2691e",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#d2691e",
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  price: {
    fontSize: 15,
    color: "#d2691e",
    marginVertical: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    backgroundColor: "#fff4e6",
    borderRadius: 6,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d2691e40",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d2691e",
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#d2691e",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 2,
    borderTopColor: "#d2691e70",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d2691e",
  },
  buttonContainer: {
    marginTop: 15,
  },
  checkoutButton: {
    backgroundColor: "#d2691e",
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
