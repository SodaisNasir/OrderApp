import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../important/Colors';
import { imageUrl } from '../../../important/Urls';

const PRODUCTS_API = 'https://foodola.foodola.shop/API/POS/get_all_products.php';
const CATEGORIES_API = 'https://foodola.foodola.shop/API/POS/get_categories.php';
const SUBCATEGORIES_API = 'https://foodola.foodola.shop/API/getAll_subcategories.php';
const CART_STORAGE_KEY = '@pos_cart_items';

const SIDE_ICONS = [
  'format-list-bulleted',
  'chair-rolling',
  'home-outline',
  'cash-register',
];

const NUM_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', ',', '×'],
];

const RIGHT_ACTIONS = [
  { type: 'plu' },
  { type: 'euro' },
  { type: 'flip' },
  { type: 'preise' },
];

const chunkPairs = (arr) => {
  const result = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2));
  }
  return result;
};

const NumpadScreen = ({ navigation }) => {
  const [inputVal, setInputVal] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDressing, setSelectedDressing] = useState(null);

  useEffect(() => {
    loadSavedCart();
    fetchInitialData();
  }, []);

  const loadSavedCart = async () => {
    try {
      const saved = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.log('Error reading cart storage:', e);
    }
  };

  const persistCart = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.log('Error saving cart storage:', e);
    }
  };

  const fetchInitialData = () => {
    Promise.all([
      fetch(PRODUCTS_API)
        .then(res => res.json())
        .catch(() => []),
      fetch(CATEGORIES_API)
        .then(res => res.json())
        .catch(() => []),
      fetch(SUBCATEGORIES_API)
        .then(res => res.json())
        .catch(() => []),
    ])
      .then(([prods, cats, subcats]) => {
        if (Array.isArray(prods)) {setProducts(prods);}
        if (Array.isArray(cats)) {setCategories(cats);}
        if (Array.isArray(subcats)) {setSubcategories(subcats);}
      })
      .catch(err => {
        console.log('Data fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleKeyPress = useCallback((val) => {
    setInputVal(prev => prev + val);
  }, []);

  const handleBackspace = useCallback(() => {
    setInputVal(prev => prev.slice(0, -1));
  }, []);

  const handleConfirmSKU = () => {
    if (!inputVal) {return;}
    const query = inputVal.trim();
    const matches = products.filter(p => String(p.sku_id).trim() === query);

    if (matches.length === 0) {
      Alert.alert('Nicht gefunden', `Kein Produkt mit SKU "${inputVal}" gefunden.`);
      return;
    }

    const matchedProduct =
      matches.find(
        p =>
          (p.addons && p.addons.length > 0) ||
          (p.types && p.types.length > 0) ||
          (p.dressings && p.dressings.length > 0),
      ) || matches[0];

    handleProductSelection(matchedProduct);
  };

  const handleProductSelection = (product) => {
    const hasExtras =
      (product.addons && product.addons.length > 0) ||
      (product.types && product.types.length > 0) ||
      (product.dressings && product.dressings.length > 0);

    if (hasExtras) {
      setSelectedProduct(product);
      setSelectedAddons([]);
      setSelectedType(null);
      setSelectedDressing(null);
      setModalVisible(true);
    } else {
      addToCart(product, [], null, null);
      setInputVal('');
    }
  };

  const addToCart = (product, addons, type, dressing) => {
    let price = parseFloat(product.price) || 0;
    addons.forEach(a => {
      price += parseFloat(a.as_price) || 0;
    });
    if (type) {price += parseFloat(type.price) || 0;}
    if (dressing) {price += parseFloat(dressing.price) || 0;}

    const newItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product,
      addons,
      type,
      dressing,
      totalPrice: price.toFixed(2),
    };

    const nextCart = [...cartItems, newItem];
    setCartItems(nextCart);
    persistCart(nextCart);

    setInputVal('');
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const deleteCartItem = (id) => {
    const nextCart = cartItems.filter(item => item.id !== id);
    setCartItems(nextCart);
    persistCart(nextCart);
  };

  const clearCart = () => {
    if (cartItems.length === 0) {return;}
    Alert.alert('Warenkorb leeren', 'Möchten Sie alle Artikel entfernen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setCartItems([]);
          persistCart([]);
        },
      },
    ]);
  };

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.as_id === addon.as_id);
      if (exists) {
        return prev.filter(a => a.as_id !== addon.as_id);
      }
      return [...prev, addon];
    });
  };

  const modalTotal = useMemo(() => {
    if (!selectedProduct) {return '0.00';}
    let sum = parseFloat(selectedProduct.price) || 0;
    selectedAddons.forEach(a => {
      sum += parseFloat(a.as_price) || 0;
    });
    if (selectedType) {sum += parseFloat(selectedType.price) || 0;}
    if (selectedDressing) {sum += parseFloat(selectedDressing.price) || 0;}
    return sum.toFixed(2);
  }, [selectedProduct, selectedAddons, selectedType, selectedDressing]);

  const grandTotal = useMemo(() => {
    return cartItems
      .reduce((acc, item) => acc + (parseFloat(item.totalPrice) || parseFloat(item.product?.price) || 0), 0)
      .toFixed(2)
      .replace('.', ',');
  }, [cartItems]);

  const categoryTabs = subcategories.length > 0 ? subcategories : categories;

  const filteredProducts = useMemo(() => {
    if (!activeCategory) {return products;}
    return products.filter(
      p =>
        String(p.category_id) === String(activeCategory.id) ||
        String(p.sub_category_id) === String(activeCategory.id),
    );
  }, [products, activeCategory]);

  const productPairs = useMemo(() => chunkPairs(filteredProducts), [filteredProducts]);

  const renderRightAction = (action, idx) => {
    if (action.type === 'plu') {
      return (
        <TouchableOpacity key={idx} style={[styles.cell, styles.specialCell]}>
          <Text style={styles.plusSign}>+</Text>
          <Text style={styles.actionLabel}>PLU</Text>
        </TouchableOpacity>
      );
    }
    if (action.type === 'euro') {
      return (
        <TouchableOpacity key={idx} style={[styles.cell, styles.specialCell]}>
          <Text style={styles.bigNum}>€</Text>
        </TouchableOpacity>
      );
    }
    if (action.type === 'flip') {
      return (
        <TouchableOpacity
          key={idx}
          style={[styles.cell, styles.flipActionCell]}
          onPress={() => setIsFlipped(true)}>
          <MaterialCommunityIcons name="swap-horizontal" size={24} color="#1565c0" />
          <Text style={styles.flipActionLabel}>Flip</Text>
        </TouchableOpacity>
      );
    }
    if (action.type === 'preise') {
      return (
        <TouchableOpacity key={idx} style={[styles.cell, styles.specialCell]}>
          <MaterialCommunityIcons name="cash" size={18} color="#444" />
          <Text style={styles.actionLabel}>Preise</Text>
        </TouchableOpacity>
      );
    }
    return <View key={idx} style={[styles.cell, styles.specialCell]} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.onlineDot} />
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.topBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn}>
            <MaterialCommunityIcons name="share-outline" size={22} color="#333" />
            <Text style={styles.badgeText}>{cartItems.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBtn}>
            <MaterialCommunityIcons name="magnify" size={22} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.posHeader}>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name="table-chair" size={19} color="#333" />
          <Text style={styles.headerItemText}>Tisch</Text>
        </View>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name="account" size={19} color="#333" />
          <Text style={styles.headerItemText}>1 BEDIENER 1</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.euroPrefix}>€</Text>
          <Text style={styles.headerItemText}>{grandTotal}</Text>
        </View>
      </View>

      <View style={styles.cartContainer}>
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary || '#888'} />
          </View>
        ) : (
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.cartRow}>
                <View style={styles.cartInfo}>
                  <Text style={styles.cartItemName}>{item.product?.name}</Text>
                  {item.type && (
                    <Text style={styles.cartItemSub}>+ {item.type.ts_name}</Text>
                  )}
                  {item.dressing && (
                    <Text style={styles.cartItemSub}>+ {item.dressing.dressing_name}</Text>
                  )}
                  {item.addons?.map(a => (
                    <Text key={a.as_id} style={styles.cartItemSub}>+ {a.as_name}</Text>
                  ))}
                </View>
                <View style={styles.cartItemEnd}>
                  <Text style={styles.cartItemPrice}>€{item.totalPrice || item.product?.price}</Text>
                  <TouchableOpacity
                    onPress={() => deleteCartItem(item.id)}
                    style={styles.cartDeleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.cartEmptyWrap}>
                <Text style={styles.cartEmptyText}>Keine Artikel im Warenkorb</Text>
              </View>
            }
          />
        )}
      </View>

      {isFlipped ? (
        <View style={styles.catalogWrap}>
          <View style={styles.categoryNav}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              <TouchableOpacity
                style={[styles.categoryTab, activeCategory === null && styles.categoryTabActive]}
                onPress={() => setActiveCategory(null)}>
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === null && styles.categoryTabTextActive,
                  ]}>
                  Alle
                </Text>
              </TouchableOpacity>
              {categoryTabs.map(cat => {
                const isSelected = activeCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                    onPress={() => setActiveCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryTabText,
                        isSelected && styles.categoryTabTextActive,
                      ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.productGrid}>
            <FlatList
              horizontal
              data={productPairs}
              keyExtractor={(_, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productGridScroll}
              renderItem={({ item: pair }) => (
                <View style={styles.productColumn}>
                  {pair.map(product => {
                    const imageSource = product.img
                      ? { uri: `${imageUrl || 'https://foodola.foodola.shop/admin_panel/Uploads/'}${product.img}` }
                      : null;

                    return (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.productCard}
                        activeOpacity={0.7}
                        onPress={() => handleProductSelection(product)}>
                        {imageSource ? (
                          <Image
                            source={imageSource}
                            style={styles.productThumbnail}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.thumbnailFallback}>
                            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#bbb" />
                          </View>
                        )}
                        <View style={styles.productDetails}>
                          <Text style={styles.productTitle} numberOfLines={2}>
                            {product.name}
                          </Text>
                          <Text style={styles.productCost}>€{product.price}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>Keine Produkte gefunden</Text>
                </View>
              }
            />
          </View>

          <View style={styles.catalogFooter}>
            <TouchableOpacity
              style={styles.backToNumpadBtn}
              onPress={() => setIsFlipped(false)}>
              <MaterialCommunityIcons name="dialpad" size={20} color="#fff" />
              <Text style={styles.backToNumpadText}>Numpad</Text>
            </TouchableOpacity>
            <View style={styles.catalogTotalWrap}>
              <Text style={styles.catalogCount}>{cartItems.length} Artikel</Text>
              <Text style={styles.catalogTotal}>€{grandTotal}</Text>
            </View>
            <TouchableOpacity style={styles.catalogDeleteBtn} onPress={clearCart}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#c00" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.inputBar}>
            <View style={styles.inputPrefix}>
              <MaterialCommunityIcons name="undo" size={20} color="#444" />
              <Text style={styles.prefixNumber}>0</Text>
            </View>
            <View style={styles.inputField}>
              <Text style={styles.inputText}>{inputVal}</Text>
            </View>
            <TouchableOpacity onPress={handleBackspace} style={styles.backspaceBtn}>
              <MaterialCommunityIcons name="close" size={25} color="red" />
            </TouchableOpacity>
          </View>

          <View style={styles.numpad}>
            {NUM_ROWS.map((row, rIdx) => (
              <View key={rIdx} style={styles.padRow}>
                <View style={styles.sideCell}>
                  <MaterialCommunityIcons name={SIDE_ICONS[rIdx]} size={21} color="#444" />
                </View>
                {row.map(k => (
                  <TouchableOpacity
                    key={k}
                    style={styles.cell}
                    onPress={() => handleKeyPress(k)}>
                    <Text style={styles.bigNum}>{k}</Text>
                  </TouchableOpacity>
                ))}
                {renderRightAction(RIGHT_ACTIONS[rIdx], rIdx)}
              </View>
            ))}
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={[styles.bottomBtn, styles.greenBtn]}>
              <MaterialCommunityIcons name="cash-register" size={23} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtn} onPress={clearCart}>
              <MaterialCommunityIcons name="trash-can-outline" size={23} color="#444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtn}>
              <MaterialCommunityIcons name="format-list-bulleted" size={23} color="#444" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomBtn}
              onPress={() => setIsFlipped(true)}>
              <MaterialCommunityIcons name="calculator-variant-outline" size={23} color="#444" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomBtn, styles.greenBtn]} onPress={handleConfirmSKU}>
              <MaterialCommunityIcons name="check" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeadline} numberOfLines={1}>
                {selectedProduct?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentInner}
              showsVerticalScrollIndicator={true}>
              {selectedProduct?.types?.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={styles.optionSectionTitle}>
                    {selectedProduct.types[0]?.type_title || 'Types'}
                  </Text>
                  {selectedProduct.types.map(t => (
                    <TouchableOpacity
                      key={t.ts_id}
                      style={styles.optionItem}
                      activeOpacity={0.7}
                      onPress={() =>
                        setSelectedType(selectedType?.ts_id === t.ts_id ? null : t)
                      }>
                      <View style={styles.radioBorder}>
                        {selectedType?.ts_id === t.ts_id && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                      <Text style={styles.optionLabel}>{t.ts_name}</Text>
                      {parseFloat(t.price) > 0 && (
                        <Text style={styles.optionCharge}>
                          +€{parseFloat(t.price).toFixed(2)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedProduct?.dressings?.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={styles.optionSectionTitle}>
                    {selectedProduct.dressings[0]?.dressing_title || 'Dressings'}
                  </Text>
                  {selectedProduct.dressings.map(d => (
                    <TouchableOpacity
                      key={d.ds_id}
                      style={styles.optionItem}
                      activeOpacity={0.7}
                      onPress={() =>
                        setSelectedDressing(
                          selectedDressing?.ds_id === d.ds_id ? null : d,
                        )
                      }>
                      <View style={styles.radioBorder}>
                        {selectedDressing?.ds_id === d.ds_id && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                      <Text style={styles.optionLabel}>{d.dressing_name}</Text>
                      {parseFloat(d.price) > 0 && (
                        <Text style={styles.optionCharge}>
                          +€{parseFloat(d.price).toFixed(2)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedProduct?.addons?.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={styles.optionSectionTitle}>
                    {selectedProduct.addons[0]?.ao_title || 'Addons'}
                  </Text>
                  {selectedProduct.addons.map(a => {
                    const isChecked = Boolean(
                      selectedAddons.find(x => x.as_id === a.as_id),
                    );
                    return (
                      <TouchableOpacity
                        key={a.as_id}
                        style={styles.optionItem}
                        activeOpacity={0.7}
                        onPress={() => toggleAddon(a)}>
                        <View style={[styles.checkSquare, isChecked && styles.checkSquareActive]}>
                          {isChecked && (
                            <MaterialCommunityIcons name="check" size={14} color="#fff" />
                          )}
                        </View>
                        <Text style={styles.optionLabel}>{a.as_name}</Text>
                        {parseFloat(a.as_price) > 0 && (
                          <Text style={styles.optionCharge}>
                            +€{parseFloat(a.as_price).toFixed(2)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalBottom}>
              <View>
                <Text style={styles.summaryLabel}>Gesamtpreis</Text>
                <Text style={styles.summaryPrice}>€{modalTotal}</Text>
              </View>
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={() =>
                  addToCart(
                    selectedProduct,
                    selectedAddons,
                    selectedType,
                    selectedDressing,
                  )
                }>
                <Text style={styles.submitBtnText}>Hinzufügen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NumpadScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#c8c8d0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#aaa',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  badgeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  posHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#bbb',
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerItemText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  euroPrefix: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 3,
  },
  cartContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loaderWrap: {
    marginTop: 35,
    alignItems: 'center',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  cartInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  cartItemSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  cartItemEnd: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingLeft: 10,
    gap: 8,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  cartDeleteBtn: {
    padding: 2,
  },
  cartEmptyWrap: {
    paddingTop: 40,
    alignItems: 'center',
  },
  cartEmptyText: {
    color: '#aaa',
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  inputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  prefixNumber: {
    fontSize: 15,
    color: '#333',
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 18,
    color: '#000',
  },
  backspaceBtn: {
    paddingHorizontal: 10,
  },
  numpad: {
    backgroundColor: '#e0e0e0',
  },
  padRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  sideCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d5d5d5',
    borderRightWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 15,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderLeftWidth: 1,
    borderColor: '#ccc',
  },
  specialCell: {
    backgroundColor: '#d8d8d8',
  },
  bigNum: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
  },
  plusSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  actionLabel: {
    fontSize: 10,
    color: '#444',
    marginTop: 1,
  },
  flipActionCell: {
    backgroundColor: '#e3f2fd',
  },
  flipActionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1565c0',
    marginTop: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderTopWidth: 1,
    borderColor: '#bbb',
  },
  bottomBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  greenBtn: {
    backgroundColor: '#5cb85c',
  },
  catalogWrap: {
    backgroundColor: '#f2f2f2',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  categoryNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e5e5',
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  categoryScroll: {
    paddingRight: 10,
    alignItems: 'center',
    gap: 6,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  categoryTabActive: {
    backgroundColor: '#1565c0',
    borderColor: '#1565c0',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  categoryTabTextActive: {
    color: '#ffffff',
  },
  productGrid: {
    height: 250,
    paddingVertical: 8,
  },
  productGridScroll: {
    paddingHorizontal: 8,
  },
  productColumn: {
    justifyContent: 'space-between',
    marginRight: 8,
    height: 234,
  },
  productCard: {
    width: 140,
    height: 112,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  productThumbnail: {
    width: '100%',
    height: 60,
    backgroundColor: '#f0f0f0',
  },
  thumbnailFallback: {
    width: '100%',
    height: 60,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
    padding: 4,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111',
    lineHeight: 14,
  },
  productCost: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2e7d32',
    alignSelf: 'flex-end',
  },
  catalogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e0e0e0',
    borderTopWidth: 1,
    borderColor: '#bbb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backToNumpadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565c0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  backToNumpadText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  catalogTotalWrap: {
    alignItems: 'center',
  },
  catalogCount: {
    fontSize: 11,
    color: '#666',
  },
  catalogTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  catalogDeleteBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyProducts: {
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyProductsText: {
    color: '#888',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: '80%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  modalHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    marginRight: 10,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContentInner: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  optionSection: {
    marginTop: 14,
  },
  optionSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    marginLeft: 12,
  },
  optionCharge: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 8,
  },
  radioBorder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#5cb85c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5cb85c',
  },
  checkSquare: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#5cb85c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSquareActive: {
    backgroundColor: '#5cb85c',
  },
  modalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#777',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  submitBtn: {
    backgroundColor: '#5cb85c',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
