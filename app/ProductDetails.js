import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext.js';

// ---------------- ReviewItem (UI làm mới) ----------------
function ReviewItem({ review, username, onReplySuccess, myReview }) {
  const [reply, setReply] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [sending, setSending] = useState(false);

  return (
    <View style={[styles.reviewCard, myReview && styles.myReviewCard]}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewUser}>{review.username}</Text>
          <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleString()}</Text>
        </View>
        <View style={styles.starsSmall}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Text key={s} style={{ color: s <= review.rating ? '#FFD700' : '#E6E6E6', fontSize: 14 }}>★</Text>
          ))}
        </View>
      </View>

      <Text style={styles.reviewComment}>{review.comment}</Text>

      {review.replies && review.replies.length > 0 && (
        <View style={styles.repliesWrap}>
          {review.replies.map((rep, idx) => (
            <View key={idx} style={styles.replyBubble}>
              <Text style={styles.replyUser}>{rep.user}</Text>
              <Text style={styles.replyText}>{rep.content}</Text>
              <Text style={styles.replyDate}>{new Date(rep.repliedAt).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.reviewActions}>
        <TouchableOpacity onPress={() => setShowReplyBox((v) => !v)} style={styles.replyToggle}>
          <Text style={styles.replyToggleText}>Trả lời</Text>
        </TouchableOpacity>
      </View>

      {showReplyBox && (
        <View style={styles.replyRow}>
          <TextInput
            placeholder="Viết trả lời..."
            value={reply}
            onChangeText={setReply}
            style={styles.replyInput}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.replySendBtn, (sending || reply.trim() === '') && styles.btnDisabled]}
            onPress={async () => {
              if (!reply.trim()) return;
              setSending(true);
              try {
                const res = await fetch(`http://103.249.117.201:12732/reviews/reply/${review._id}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user: username, content: reply }),
                });
                if (res.ok) {
                  setReply('');
                  setShowReplyBox(false);
                  if (onReplySuccess) onReplySuccess();
                } else {
                  Alert.alert('Lỗi', 'Không thể gửi trả lời');
                }
              } catch (e) {
                Alert.alert('Lỗi', 'Không thể gửi trả lời');
              } finally {
                setSending(false);
              }
            }}
            disabled={sending || reply.trim() === ''}
          >
            <Text style={styles.replySendText}>{sending ? '...' : 'Gửi'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---------------- ProductDetails (UI overhaul, logic preserved) ----------------
export default function ProductDetails() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const { addToCart, setItems } = useContext(CartContext);
  const [buying, setBuying] = useState(false);
  const router = require('expo-router').useRouter();

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        const response = await fetch(`http://103.249.117.201:12732/products/${productId}`);
        const data = await response.json();
        setProduct(data);
        setMainImage(data.images?.[0] || null);
      } catch (error) {
        console.error('❌ Lỗi khi lấy chi tiết sản phẩm:', error);
        Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm.');
      }
    }

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  async function onAddToCart() {
    if (product) {
      let productToAdd = { ...product };
      if (product.type === 'preorder') {
        productToAdd = {
          ...productToAdd,
          price: Math.floor(product.price / 10),
          name: `${product.name} (PreOrder)`,
        };
      }
      await addToCart(productToAdd);
    }
  }

  async function onBuyNow() {
    if (!product) return;
    setBuying(true);
    let productToAdd = { ...product };
    if (product.type === 'preorder') {
      productToAdd = {
        ...productToAdd,
        price: Math.floor(product.price / 10),
        name: `${product.name} (PreOrder)`,
      };
    }
    setBuying(false);
    router.push({
      pathname: '/Checkout',
      params: { buyNow: JSON.stringify([{ product: productToAdd, qty: 1 }]) },
    });
  }

  const handleAddToCart = () => {
    onAddToCart();
    if (Platform.OS === 'android' && ToastAndroid) {
      ToastAndroid.show('Đã thêm vào giỏ hàng!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Thông báo', 'Đã thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = () => {
    onBuyNow();
  };

  const { username } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoadingReviews(true);
    fetch(`http://103.249.117.201:12732/reviews/product/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data || []);
        const found = (data || []).find((r) => r.username === username);
        setMyReview(found || null);
        setLoadingReviews(false);
      })
      .catch(() => {
        setReviews([]);
        setLoadingReviews(false);
      });
  }, [productId, username, submitted]);

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <Text style={{ color: '#00203F', padding: 16 }}>Đang tải sản phẩm...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image + thumbnails */}
        <View style={styles.heroCard}>
          {mainImage ? (
            <Image source={{ uri: mainImage }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={{ color: '#fff' }}>No Image</Text>
            </View>
          )}

          <FlatList
            data={product.images || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i, idx) => `${idx}`}
            style={styles.thumbList}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setMainImage(item)}>
                <Image source={{ uri: item }} style={[styles.thumb, mainImage === item && styles.thumbActive]} />
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.productTitle}>{product.name}</Text>

          <View style={styles.row}>
            <Text style={styles.priceLabel}>Giá</Text>
            <Text style={styles.priceValue}>{product.price?.toLocaleString('vi-VN')}₫</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.metaLabel}>Thương hiệu</Text>
            <Text style={styles.metaValue}>{product.brand || '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.metaLabel}>Kho</Text>
            <Text style={styles.metaValue}>{product.stock ?? '—'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.metaLabel}>Trạng thái</Text>
            <Text style={[styles.metaValue, product.type === 'preorder' ? styles.tagPre : styles.tagAvail]}>
              {product.type === 'preorder' ? `Đặt trước (Giá đặt: ${Math.floor(product.price / 10)}₫)` : 'Có sẵn'}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleAddToCart}>
              <Text style={styles.btnText}>Thêm vào giỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnAccent, { marginLeft: 12 }]}
              onPress={handleBuyNow}
              disabled={buying}
            >
              <Text style={styles.btnText}>{buying ? 'Đang xử lý...' : 'Mua ngay'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.descriptionBox}>
            <Text style={styles.descTitle}>Mô tả</Text>
            <Text style={styles.descText}>{product.description || 'Không có mô tả.'}</Text>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>

          {loadingReviews ? (
            <Text style={{ color: '#666' }}>Đang tải đánh giá...</Text>
          ) : (
            <>
              {myReview ? (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: '700', marginBottom: 8 }}>Đánh giá của bạn</Text>
                  <ReviewItem review={myReview} username={username} onReplySuccess={() => setSubmitted((s) => !s)} myReview />
                </View>
              ) : (
                <View style={styles.writeReviewBox}>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity key={s} onPress={() => setRating(s)}>
                        <Text style={{ fontSize: 30, color: s <= rating ? '#FFD700' : '#E6E6E6' }}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    value={review}
                    onChangeText={setReview}
                    placeholder="Viết cảm nhận của bạn..."
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.submitBtn, (rating === 0 || review.trim() === '') && styles.btnDisabled]}
                    onPress={async () => {
                      try {
                        const res = await fetch('http://103.249.117.201:12732/reviews', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            username,
                            productId,
                            rating,
                            comment: review,
                          }),
                        });
                        if (res.ok) {
                          setSubmitted(true);
                          setTimeout(() => setSubmitted(false), 2000);
                          setRating(0);
                          setReview('');
                        } else {
                          const err = await res.json();
                          Alert.alert('Lỗi', err.error || 'Không thể gửi đánh giá');
                        }
                      } catch {
                        Alert.alert('Lỗi', 'Không thể gửi đánh giá');
                      }
                    }}
                    disabled={rating === 0 || review.trim() === ''}
                  >
                    <Text style={styles.submitText}>{submitted ? 'Đã gửi' : 'Gửi đánh giá'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: '700', marginBottom: 8 }}>Đánh giá từ người dùng</Text>
                {reviews.length === 0 && <Text style={{ color: '#666' }}>Chưa có đánh giá nào.</Text>}
                {reviews
                  .filter((r) => r.username !== username)
                  .map((r) => (
                    <ReviewItem key={r._id} review={r} username={username} onReplySuccess={() => setSubmitted((s) => !s)} />
                  ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------- Styles (navy + white theme) ----------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  heroCard: {
    margin: 16,
    borderRadius: 14,
    backgroundColor: '#012A4A', // navy dark backdrop for hero
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    padding: 8,
  },
  heroPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B8EA3',
  },
  thumbList: {
    marginTop: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: '#82B1FF',
  },

  // Info card
  infoCard: {
    marginHorizontal: 16,
    marginTop: -20,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#012A4A',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    alignItems: 'center',
  },
  priceLabel: { color: '#555', fontWeight: '600' },
  priceValue: { color: '#012A4A', fontWeight: '800', fontSize: 18 },
  metaLabel: { color: '#666' },
  metaValue: { color: '#333', fontWeight: '600' },
  tagPre: {
    color: '#004E89',
    fontWeight: '700',
  },
  tagAvail: {
    color: '#0071A3',
    fontWeight: '700',
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#012A4A',
  },
  btnAccent: {
    backgroundColor: '#0071A3',
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },

  descriptionBox: {
    marginTop: 14,
    backgroundColor: '#F2F6FA',
    padding: 12,
    borderRadius: 10,
  },
  descTitle: {
    fontWeight: '700',
    color: '#012A4A',
    marginBottom: 6,
  },
  descText: {
    color: '#333',
  },

  // Reviews
  reviewsSection: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#012A4A',
    marginBottom: 8,
  },
  writeReviewBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    elevation: 2,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#E6EEF8',
    borderRadius: 8,
    padding: 10,
    minHeight: 70,
    backgroundColor: '#FAFCFE',
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#004E89',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },

  // ReviewItem styles
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  myReviewCard: {
    borderColor: '#D1E9FF',
    backgroundColor: '#F4FBFF',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#012A4A',
    fontWeight: '800',
    fontSize: 16,
  },
  reviewUser: {
    fontWeight: '700',
    color: '#012A4A',
  },
  reviewDate: { fontSize: 12, color: '#8899A6' },
  starsSmall: { flexDirection: 'row' },
  reviewComment: { marginBottom: 8, color: '#333' },
  repliesWrap: { marginLeft: 8, marginTop: 6 },
  replyBubble: {
    backgroundColor: '#F0FAF6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  replyUser: { fontWeight: '700', color: '#0B6E3A' },
  replyText: { marginTop: 4, color: '#234' },
  replyDate: { marginTop: 6, fontSize: 11, color: '#8899A6' },

  reviewActions: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  replyToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EEF7FF',
  },
  replyToggleText: { color: '#0066A3', fontWeight: '700' },

  replyRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6EEF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  replySendBtn: {
    backgroundColor: '#00693B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  replySendText: { color: '#fff', fontWeight: '700' },

  btnDisabled: { opacity: 0.5 },
});
