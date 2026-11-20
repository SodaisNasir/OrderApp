import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../important/Colors';

const CART_STORAGE_KEY = '@pos_cart_items';
const POS_TOKEN = 'as23rlkjadsnlkcj23qkjnfsDKJcnzdfb3353ads54vd3favaeveavgbqaerbVEWDSC';
const LOCATION_IQ_KEY = 'ff37d0c290fddc';
const DEFAULT_BRANCH_ID = '224';
const DEFAULT_BASE_URL = 'https://foodola.foodola.shop';

const getDynamicImageUrl = (imgPath, storeBaseUrl) => {
  if (!imgPath || typeof imgPath !== 'string') return null;
  const trimmed = imgPath.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const root = (storeBaseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const clean = trimmed.replace(/^\/+/, '');
  if (clean.toLowerCase().startsWith('admin_panel/uploads/')) {
    return `${root}/${clean}`;
  }
  if (clean.toLowerCase().startsWith('uploads/')) {
    return `${root}/admin_panel/${clean}`;
  }
  return `${root}/admin_panel/Uploads/${clean}`;
};

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

const parseDateString = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[\sT]+/);
  if (parts.length >= 2) {
    const [y, m, d] = parts[0].split('-').map(Number);
    const timeParts = parts[1].split(':').map(Number);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m - 1, d, timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0);
    }
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const formatTimeAgo = (occupiedAt) => {
  if (!occupiedAt) {
    return null;
  }
  const occDate = parseDateString(occupiedAt);
  if (!occDate) {
    return null;
  }
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - occDate.getTime()) / 1000));
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const TableCardItem = React.memo(({
  table,
  isSelected,
  onSelect,
  orderSummary,
  baseUrl,
}) => {
  const isOccupied = table.status?.toLowerCase() === 'occupied';
  const [elapsed, setElapsed] = useState(() => (isOccupied ? formatTimeAgo(table.occupied_at) : null));
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isOccupied || !table.occupied_at) {
      setElapsed(null);
      return;
    }
    setElapsed(formatTimeAgo(table.occupied_at));
    const timer = setInterval(() => {
      setElapsed(formatTimeAgo(table.occupied_at));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOccupied, table.occupied_at]);

  const hasReservations = Array.isArray(table.today_reservations) && table.today_reservations.length > 0;
  const hasOrderItems =
    orderSummary &&
    (orderSummary.count > 0 || (orderSummary.priceFormatted && orderSummary.priceFormatted !== '0,00 €'));

  const imageUri = getDynamicImageUrl(table.table_image, baseUrl);

  return (
    <TouchableOpacity
      style={[
        styles.tableCard,
        isSelected && styles.tableCardSelected,
        isOccupied ? styles.tableCardOccupiedBorder : styles.tableCardAvailableBorder,
      ]}
      activeOpacity={0.8}
      onPress={() => onSelect(table)}>

      {/* Top-Left: Reservations Count Badge (website feature) */}
      {hasReservations && (
        <View style={styles.tableReservationBadge}>
          <Text style={styles.tableReservationBadgeText}>{table.today_reservations.length}</Text>
        </View>
      )}

      {/* Top-Right: Order Summary Badge (website feature: total | count items) */}
      {hasOrderItems && (
        <View style={styles.tableCardBadge}>
          <Text style={styles.tableCardBadgeText}>
            {orderSummary.count > 0
              ? `${orderSummary.priceFormatted} | ${orderSummary.count} items`
              : orderSummary.priceFormatted}
          </Text>
        </View>
      )}

      {/* Table Image from /admin_panel/Uploads/ (website feature) */}
      <View style={styles.tableImageContainer}>
        {imageUri && !imageError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.tableImage}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.tableImageFallback}>
            <MaterialCommunityIcons
              name="table-chair"
              size={44}
              color={isSelected ? '#e53935' : '#777'}
            />
          </View>
        )}
      </View>

      {/* Table Name and Status Pill (website feature) */}
      <View style={styles.tableNameRow}>
        <Text
          style={[styles.tableNameText, isSelected && styles.tableNameTextSelected]}
          numberOfLines={1}>
          {table.table_name}
        </Text>
        <View
          style={[
            styles.statusPill,
            isOccupied ? styles.statusPillOccupied : styles.statusPillAvailable,
          ]}>
          <Text style={styles.statusPillText}>{table.status || (isOccupied ? 'occupied' : 'available')}</Text>
        </View>
      </View>

      {/* Seats Capacity */}
      {table.seats ? (
        <Text style={[styles.tableSeatsText, isSelected && styles.tableSeatsTextSelected]}>
          {table.seats} Plätze{table.min && table.maximum ? ` (${table.min}-${table.maximum})` : ''}
        </Text>
      ) : null}

      {/* Live Occupied Timer Badge: updates every second (website feature) */}
      {isOccupied && elapsed ? (
        <View style={styles.occupiedTimePill}>
          <MaterialCommunityIcons name="clock-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.occupiedTimePillText} numberOfLines={1}>
            Occupied {elapsed} ago
          </Text>
        </View>
      ) : (
        <View style={styles.availableSpacer} />
      )}
    </TouchableOpacity>
  );
});

const NumpadScreen = ({ navigation }) => {
  const [inputVal, setInputVal] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const reduxAccount = useSelector(state => state.auth?.GetAccount);
  const initialBaseUrl = reduxAccount?.base_url
    ? reduxAccount.base_url.replace(/\/+$/, '')
    : DEFAULT_BASE_URL;

  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [branchId, setBranchId] = useState(DEFAULT_BRANCH_ID);

  // Delivery / Pickup (Order Details) state
  const [orderDetailsVisible, setOrderDetailsVisible] = useState(false);
  const [orderType, setOrderType] = useState('delivery'); // 'pickup' | 'delivery'
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [streetQuery, setStreetQuery] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [userPickerVisible, setUserPickerVisible] = useState(false);
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const streetSearchTimeoutRef = useRef(null);

  // Tables state
  const [tablesModalVisible, setTablesModalVisible] = useState(false);
  const [tables, setTables] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loadingTables, setLoadingTables] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productAddonQtys, setProductAddonQtys] = useState({});
  const [productSelectedDressings, setProductSelectedDressings] = useState([]);
  const [productSelectedType, setProductSelectedType] = useState(null);

  // Cart summary, tax & shipping states (matching foodola-pos)
  const [additionalDiscount, setAdditionalDiscount] = useState('');
  const [isShippingEnabled, setIsShippingEnabled] = useState(false);
  const [shippingCost, setShippingCost] = useState('0.00');
  const [paymentType, setPaymentType] = useState('cash'); // 'cash' | 'online'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);


  // deal modal state: { [item_id]: { prod, addons, type, dressing } }
  const [dealModalVisible, setDealModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealSelections, setDealSelections] = useState({});

  useEffect(() => {
    loadSavedCart();
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const syncTableOrder = async (tblId, items) => {
    if (!tblId) {return;}
    try {
      const payloadDetails = items.map(it => {
        if (it.product?.isDeal || it.isDeal) {
          return {
            is_deal: 'yes',
            deal_id: String(it.product?.id || it.deal_id || ''),
            deal_name: it.product?.name || it.deal_name || '',
            deal_price: String(it.unitPrice || it.product?.price || '0'),
            deal_qty: it.quantity,
            deal_items: it.deal_items || [],
            total: String(it.totalPrice || it.unitPrice || '0'),
            quantity: it.quantity,
            priceWithAddons: parseFloat(it.unitPrice) || 0,
          };
        }
        if (it.rawTableItem) {
          return {
            ...it.rawTableItem,
            quantity: it.quantity,
          };
        }
        return {
          id: String(it.product?.id || ''),
          addon_id: '0',
          type_id: it.type?.ts_id ? String(it.type.ts_id) : '-1',
          dressing_id: it.dressing?.ds_id ? String(it.dressing.ds_id) : '-1',
          sub_category_id: it.product?.sub_category_id || '',
          time_id: null,
          name: it.product?.name || '',
          sku_id: String(it.product?.sku_id || ''),
          description: it.product?.description || '',
          cost: it.product?.cost || '0',
          price: String(it.unitPrice || it.product?.price || '0'),
          discount: '0',
          qty: '100000',
          tax: '7',
          for_deal_only: '0',
          img: it.product?.img || '',
          features: 'Yes',
          status: 'Active',
          addons: it.addons || [],
          types: it.type ? [it.type] : [],
          dressings: it.dressing ? [it.dressing] : [],
          category_id: it.product?.category_id || '',
          quantity: it.quantity,
          priceWithAddons: parseFloat(it.unitPrice) || 0,
        };
      });

      const bUrl = baseUrl || DEFAULT_BASE_URL;
      const formBody = [
        `token=${encodeURIComponent(POS_TOKEN)}`,
        `tbl_id=${encodeURIComponent(tblId)}`,
        `branch_id=${encodeURIComponent(branchId)}`,
        `order_details=${encodeURIComponent(JSON.stringify(payloadDetails))}`,
        `device_id=${encodeURIComponent('819d3f09-390f-40ee-9bd7-3de8bdc4425a')}`,
        `socket_id=${encodeURIComponent('914467.3149093')}`,
      ].join('&');

      await fetch(`${bUrl}/API/POS/add_table_order.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formBody,
      });

      fetchTablesData(bUrl, branchId);
    } catch (e) {
      console.log('Error syncing table order:', e);
    }
  };

  const changeTableStatus = async (tableId, status) => {
    try {
      const now = new Date();
      const formattedTime =
        now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

      const bUrl = baseUrl || DEFAULT_BASE_URL;
      const body = [
        `token=${encodeURIComponent(POS_TOKEN)}`,
        `table_id=${encodeURIComponent(tableId)}`,
        `time=${encodeURIComponent(formattedTime)}`,
        `status=${encodeURIComponent(status)}`,
      ].join('&');

      await fetch(`${bUrl}/API/POS/change_table_status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body,
      });

      setTables(prev =>
        prev.map(t =>
          String(t.id) === String(tableId)
            ? { ...t, status, occupied_at: status === 'occupied' ? formattedTime : null }
            : t,
        ),
      );
      if (selectedTable && String(selectedTable.id) === String(tableId)) {
        setSelectedTable(prev =>
          prev ? { ...prev, status, occupied_at: status === 'occupied' ? formattedTime : null } : null,
        );
      }
    } catch (e) {
      console.log('Error changing table status:', e);
    }
  };

  const clearTableOrder = async (tableId) => {
    try {
      const bUrl = baseUrl || DEFAULT_BASE_URL;
      const body = `token=${encodeURIComponent(POS_TOKEN)}&tbl_id=${encodeURIComponent(tableId)}`;
      await fetch(`${bUrl}/API/POS/clear_order.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body,
      });
      await changeTableStatus(tableId, 'available');
      fetchTablesData();
    } catch (e) {
      console.log('Error clearing table order:', e);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Hinweis', 'Der Warenkorb ist leer.');
      return;
    }

    const discNum = parseFloat(additionalDiscount) || 0;
    if (discNum > rawCartTotal) {
      Alert.alert(
        'Rabatt ungültig',
        `Der Rabatt (€${discNum.toFixed(2)}) darf nicht höher als die Zwischensumme (€${rawCartTotal.toFixed(2)}) sein.`,
      );
      return;
    }
    if (discNum < 0) {
      Alert.alert('Rabatt ungültig', 'Der Rabatt darf nicht negativ sein.');
      return;
    }

    setIsPlacingOrder(true);
    const { bUrl, bId } = await resolveBaseUrlAndBranch();

    if (!selectedTable && orderType === 'delivery') {
      if (!selectedUser && !customerName) {
        Alert.alert('Kunde fehlt', 'Bitte wählen Sie zuerst einen Kunden für die Lieferung aus oder geben Sie Kundendaten ein.');
        setOrderDetailsVisible(true);
        setIsPlacingOrder(false);
        return;
      }
      if (!selectedArea) {
        Alert.alert('Liefergebiet fehlt', 'Bitte wählen Sie ein Liefergebiet (Postleitzahl) aus.');
        setOrderDetailsVisible(true);
        setIsPlacingOrder(false);
        return;
      }
      if (!streetQuery && !selectedUser?.street) {
        Alert.alert('Straße fehlt', 'Bitte geben Sie die Lieferadresse (Straße) ein.');
        setOrderDetailsVisible(true);
        setIsPlacingOrder(false);
        return;
      }
    }

    try {
      const orderDetailsPayload = cartItems.map(item => {
        if (item.product?.isDeal || item.isDeal) {
          return {
            is_deal: 'yes',
            deal_id: String(item.product?.id || item.deal_id || ''),
            deal_name: item.product?.name || item.deal_name || '',
            deal_price: String(item.unitPrice || item.product?.price || '0'),
            custom_price: null,
            deal_qty: item.quantity,
            deal_items: item.deal_items || [],
            total: String(item.totalPrice || item.unitPrice || '0'),
          };
        }
        return {
          ...item,
          price: item.unitPrice || item.product?.price,
          custom_price: null,
          qty: item.quantity,
          is_deal: 'no',
          dressings: [],
          dressing: item.dressing ? [item.dressing] : [],
          addons: item.addons || [],
        };
      });

      // Item discounts total (foodola-pos calculateTotalDiscount formula)
      const itemDiscountsTotal = cartItems.reduce((acc, item) => {
        if (item.product?.isDeal || item.isDeal) {return acc;}
        const disc = Number(item.discount || item.product?.discount || 0);
        if (disc > 0) {
          const p = Number(item.unitPrice || item.product?.price || 0);
          const discAmount = p * (disc / 100);
          return acc + discAmount * (Number(item.quantity) || 1);
        }
        return acc;
      }, 0);
      const totalCombinedDiscount = (itemDiscountsTotal + discNum).toFixed(2);

      const body = new URLSearchParams({
        token: POS_TOKEN,
        platform: 'pos',
        branch_id: String(bId),
        user_id: selectedUser ? String(selectedUser.id) : String(bId),
        payment_type: paymentType,
        payment_status: 'paid',
        order_status: 'pending',
        payment_method: paymentType === 'cash' ? 'Cash on delivery' : 'online',
        total_amount: String(grandTotal),
        total_netto_tax: String(nettoTotal),
        total_metto_tax: String(mettoTotal),
        additional_pos_discount: discNum.toFixed(2),
        total_discount: String(totalCombinedDiscount),
        shipping_cost: isShippingEnabled ? String(shippingCost) : '0',
        shipping: isShippingEnabled ? '1' : '0',
        order_details: JSON.stringify(orderDetailsPayload),
      });

      if (selectedTable) {
        body.append('table_id', String(selectedTable.id));
        body.append('order_type', 'dine_in');
      } else {
        body.append('order_type', orderType);
        if (orderType === 'delivery') {
          body.append('street', streetQuery || (selectedUser?.street || ''));
          body.append('house_no', houseNo || (selectedUser?.house_no || ''));
          body.append('postal_code', selectedArea?.postal_code || (selectedUser?.postal_code || ''));
          body.append('city', selectedArea?.city || (selectedUser?.city || ''));
        }
      }

      const res = await fetch(`${bUrl}/API/POS/place_order.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: body.toString(),
      });

      const data = await res.json();
      if (data && (data.status === true || data.status === 'true' || data.statusCode === 200 || data.order_id)) {
        Alert.alert(
          'Erfolg',
          selectedTable
            ? `Bestellung für Tisch "${selectedTable.table_name}" erfolgreich aufgegeben!`
            : 'Bestellung erfolgreich aufgegeben!',
        );

        if (selectedTable) {
          await clearTableOrder(selectedTable.id);
          setSelectedTable(null);
        } else {
          await AsyncStorage.removeItem(CART_STORAGE_KEY);
        }
        setCartItems([]);
        setAdditionalDiscount('');
        setIsShippingEnabled(false);
        setShippingCost('0.00');
        setOrderDetailsVisible(false);
        fetchTablesData();
      } else {
        const errMsg = data?.message || data?.msg || data?.error || 'Bestellung konnte nicht aufgegeben werden.';
        Alert.alert('Fehler beim Bestellen', errMsg);
      }
    } catch (err) {
      console.log('Error placing order:', err);
      Alert.alert('Netzwerkfehler', 'Verbindung zum Server fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const saveCart = (items) => {
    setCartItems(items);
    if (selectedTable) {
      if (items.length > 0 && selectedTable.status?.toLowerCase() !== 'occupied') {
        changeTableStatus(selectedTable.id, 'occupied');
      }
      syncTableOrder(selectedTable.id, items);
    } else {
      persistCart(items);
    }
  };

  const resolveBaseUrlAndBranch = async () => {
    let bUrl = reduxAccount?.base_url
      ? reduxAccount.base_url.replace(/\/+$/, '')
      : DEFAULT_BASE_URL;
    let bId = DEFAULT_BRANCH_ID;
    try {
      const pdfBase = await AsyncStorage.getItem('PdfBaseUrl');
      if (pdfBase) {
        bUrl = pdfBase.replace(/\/+$/, '');
      } else {
        const storedBase = await AsyncStorage.getItem('baseUrl');
        if (storedBase) {
          bUrl = storedBase.replace(/\/Laravel\/api\/?$/i, '').replace(/\/+$/, '');
        }
      }
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.branch_id) {
          bId = String(u.branch_id);
        } else if (u.id && String(u.id).length > 2) {
          bId = String(u.id);
        }
      }
      const auth = await AsyncStorage.getItem('AuthDetails');
      if (auth) {
        const parsed = JSON.parse(auth);
        if (parsed.base_url && !pdfBase) {
          bUrl = parsed.base_url.replace(/\/+$/, '');
        }
        if (parsed.branch_id) {
          bId = String(parsed.branch_id);
        }
      }
    } catch (e) {
      console.log('Error reading base url/branch:', e);
    }
    setBaseUrl(bUrl);
    setBranchId(bId);
    return { bUrl, bId };
  };

  const fetchTablesData = async (customBUrl, customBId) => {
    let bUrl = customBUrl || baseUrl || DEFAULT_BASE_URL;
    let bId = customBId || branchId || DEFAULT_BRANCH_ID;
    setLoadingTables(true);
    try {
      const fetchTablesFor = async (targetUrl, targetBranch) => {
        try {
          const body = `token=${encodeURIComponent(POS_TOKEN)}&branch_id=${encodeURIComponent(targetBranch)}`;
          const res = await fetch(`${targetUrl}/API/POS/get_tables.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            body,
          });
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            return json;
          }
          if (Array.isArray(json?.data) && json.data.length > 0) {
            return json.data;
          }
          return null;
        } catch (e) {
          return null;
        }
      };

      // 1. Try with currently configured URL and branch
      let tblRes = await fetchTablesFor(bUrl, bId);

      // 2. If no tables returned, fallback to DEFAULT_BRANCH_ID ('224')
      if (!tblRes && bId !== DEFAULT_BRANCH_ID) {
        tblRes = await fetchTablesFor(bUrl, DEFAULT_BRANCH_ID);
        if (tblRes) {
          bId = DEFAULT_BRANCH_ID;
          setBranchId(DEFAULT_BRANCH_ID);
        }
      }

      // 3. If still no tables, fallback to DEFAULT_BASE_URL (foodola.foodola.shop) & branch 224 for tables only
      if (!tblRes && bUrl !== DEFAULT_BASE_URL) {
        const demoTables = await fetchTablesFor(DEFAULT_BASE_URL, DEFAULT_BRANCH_ID);
        if (demoTables) {
          tblRes = demoTables;
        }
      }

      // Fetch table orders
      let ordRes = [];
      try {
        const ordResponse = await fetch(`${bUrl}/API/POS/get_tables_orders.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: `token=${encodeURIComponent(POS_TOKEN)}`,
        });
        ordRes = await ordResponse.json();
      } catch (e) {
        ordRes = [];
      }

      if (Array.isArray(tblRes) && tblRes.length > 0) {
        setTables(tblRes);
        if (selectedTable) {
          const fresh = tblRes.find(t => String(t.id) === String(selectedTable.id));
          if (fresh) {
            setSelectedTable(prev => ({ ...prev, ...fresh }));
          }
        }
      } else {
        setTables([]);
      }
      if (Array.isArray(ordRes)) {
        setTableOrders(ordRes);
      }
    } catch (e) {
      console.log('Error fetching tables:', e);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchInitialData = async () => {
    const { bUrl, bId } = await resolveBaseUrlAndBranch();
    fetchTablesData(bUrl, bId);

    const commonFormBody = `token=${encodeURIComponent(POS_TOKEN)}&branch_id=${encodeURIComponent(bId)}`;

    Promise.all([
      fetch(`${bUrl}/API/POS/get_all_products.php`)
        .then(res => res.json())
        .catch(() => []),
      fetch(`${bUrl}/API/POS/get_categories.php`)
        .then(res => res.json())
        .catch(() => []),
      fetch(`${bUrl}/API/getAll_subcategories.php`)
        .then(res => res.json())
        .catch(() => []),
      fetch(`${bUrl}/API/POS/get_deals.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: `token=${encodeURIComponent(POS_TOKEN)}`,
      })
        .then(res => res.json())
        .catch(() => []),
      fetch(`${bUrl}/API/POS/getareas.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: commonFormBody,
      })
        .then(res => res.json())
        .catch(() => []),
      fetch(`${bUrl}/API/POS/get_users.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: commonFormBody,
      })
        .then(res => res.json())
        .catch(() => []),
    ])
      .then(([prods, cats, subcats, dealsData, areasData, usersData]) => {
        if (Array.isArray(prods)) {setProducts(prods);}
        if (Array.isArray(cats)) {setCategories(cats);}
        if (Array.isArray(subcats)) {setSubcategories(subcats);}
        if (dealsData && Array.isArray(dealsData.deals_data)) {
          const normalized = dealsData.deals_data.map(d => ({
            id: String(d.deal_id),
            name: d.deal_name || 'Deal',
            price: d.deal_price || '0.00',
            img: d.deal_image || '',
            isDeal: true,
            deal_items: d.deal_items || [],
          }));
          setDeals(normalized);
        }
        if (Array.isArray(areasData)) {
          setAreas(areasData);
        }
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
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

  const calculateDealTotal = useMemo(() => {
    if (!selectedDeal) {return '0.00';}
    let total = parseFloat(selectedDeal.price) || 0;

    (selectedDeal.deal_items || []).forEach(item => {
      const sel = dealSelections[item.item_id] || {};
      if (sel.type) {
        total += parseFloat(sel.type.price) || 0;
      }
      if (sel.dressing) {
        total += parseFloat(sel.dressing.price) || 0;
      }
      // Calculate addons with isFreeInDeal logic (exact foodola-pos cartStore.js)
      const addonsList = Object.values(sel.addons || {});
      let remainingFree = parseInt(item.num_of_free_items, 10) || 0;
      addonsList.forEach(a => {
        const qty = a.quantity || 0;
        const price = parseFloat(a.as_price) || 0;
        const isFree = String(a.isFreeInDeal) === '1' || a.isFreeInDeal === 1;
        if (isFree && remainingFree > 0) {
          if (qty <= remainingFree) {
            remainingFree -= qty;
          } else {
            const paidQty = qty - remainingFree;
            total += paidQty * price;
            remainingFree = 0;
          }
        } else {
          total += qty * price;
        }
      });
    });

    return total.toFixed(2);
  }, [selectedDeal, dealSelections]);

  const addDealToCart = (deal, selections, calculatedUnitPrice) => {
    const sel = selections || {};
    const unitPrice = calculatedUnitPrice || calculateDealTotal || deal.price;

    const existingIndex = cartItems.findIndex(
      item =>
        item.product?.isDeal &&
        String(item.product?.id) === String(deal.id) &&
        JSON.stringify(item.dealSelections || {}) === JSON.stringify(sel),
    );

    if (existingIndex > -1) {
      const nextCart = [...cartItems];
      const existing = nextCart[existingIndex];
      const newQty = (existing.quantity || 1) + 1;
      nextCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: (parseFloat(existing.unitPrice) * newQty).toFixed(2),
      };
      saveCart(nextCart);
      return;
    }

    const formattedDealItems = (deal.deal_items || []).map(dItem => {
      const itemSel = sel[dItem.item_id] || {};
      const selProd = itemSel.prod || dItem.items_products?.[0];
      const addonsArray = Object.values(itemSel.addons || {}).filter(a => (a.quantity || 0) > 0);
      return {
        item_id: dItem.item_id,
        item_title: dItem.item_title,
        num_of_free_items: dItem.num_of_free_items,
        items_products: selProd
          ? [
              {
                prod_id: selProd.prod_id,
                prod_name: selProd.prod_name,
                addons: addonsArray,
                types: itemSel.type ? [itemSel.type] : [],
                dressing: itemSel.dressing ? [itemSel.dressing] : [],
                num_of_free_items: dItem.num_of_free_items,
              },
            ]
          : [],
      };
    });

    const newItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      product: {
        id: deal.id,
        name: deal.name,
        price: deal.price,
        img: deal.img,
        isDeal: true,
      },
      deal_items: formattedDealItems,
      dealSelections: sel,
      quantity: 1,
      unitPrice: String(unitPrice),
      totalPrice: String(unitPrice),
      isDeal: true,
    };

    const nextCart = [...cartItems, newItem];
    saveCart(nextCart);
  };

  const handleProductSelection = (product) => {
    if (product.isDeal) {
      if (product.deal_items && product.deal_items.length > 0) {
        const initSelections = {};
        product.deal_items.forEach(item => {
          const firstProd = item.items_products?.[0] || null;
          initSelections[item.item_id] = {
            prod: firstProd,
            addons: {},
            type: null,
            dressing: null,
          };
        });
        setSelectedDeal(product);
        setDealSelections(initSelections);
        setDealModalVisible(true);
      } else {
        addDealToCart(product, {}, product.price);
      }
      return;
    }

    const hasExtras =
      (product.addons && product.addons.length > 0) ||
      (product.types && product.types.length > 0) ||
      (product.dressings && product.dressings.length > 0) ||
      (product.dressing && product.dressing.length > 0);

    if (hasExtras) {
      setSelectedProduct(product);
      setProductAddonQtys({});
      setProductSelectedDressings([]);
      setProductSelectedType(null);
      setModalVisible(true);
    } else {
      addToCart(product, [], null, []);
      setInputVal('');
    }
  };

  const updateProductAddonQty = (addon, delta) => {
    setProductAddonQtys(prev => {
      const cur = prev[addon.as_id] || 0;
      const next = Math.max(0, cur + delta);
      const updated = { ...prev };
      if (next > 0) {
        updated[addon.as_id] = next;
      } else {
        delete updated[addon.as_id];
      }
      return updated;
    });
  };

  const toggleProductDressing = (dressing) => {
    setProductSelectedDressings(prev => {
      const exists = prev.some(d => d.ds_id === dressing.ds_id);
      if (exists) {
        return prev.filter(d => d.ds_id !== dressing.ds_id);
      }
      return [...prev, dressing];
    });
  };

  const setDealItemProd = (itemId, prod) => {
    setDealSelections(prev => ({
      ...prev,
      [itemId]: { prod, addons: {}, type: null, dressing: null },
    }));
  };

  const setDealItemType = (itemId, type) => {
    setDealSelections(prev => {
      const cur = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: { ...cur, type: cur.type?.ts_id === type.ts_id ? null : type },
      };
    });
  };

  const setDealItemDressing = (itemId, dressing) => {
    setDealSelections(prev => {
      const cur = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: {
          ...cur,
          dressing: cur.dressing?.ds_id === dressing.ds_id ? null : dressing,
        },
      };
    });
  };

  const updateDealItemAddonQty = (itemId, addon, delta) => {
    setDealSelections(prev => {
      const cur = prev[itemId] || {};
      const currentAddons = cur.addons || {};
      const curQty = (currentAddons[addon.as_id]?.quantity) || 0;
      const nextQty = Math.max(0, curQty + delta);
      const updated = { ...currentAddons };
      if (nextQty > 0) {
        updated[addon.as_id] = { ...addon, quantity: nextQty };
      } else {
        delete updated[addon.as_id];
      }
      return {
        ...prev,
        [itemId]: {
          ...cur,
          addons: updated,
        },
      };
    });
  };

  const getMissingDealTypeItem = useCallback(() => {
    if (!selectedDeal || !selectedDeal.deal_items) {return null;}
    for (const item of selectedDeal.deal_items) {
      const sel = dealSelections[item.item_id] || {};
      const selProd = sel.prod || item.items_products?.[0];
      if (!selProd) {continue;}

      const hasTypes = (selProd.types || []).some(
        tg => (tg.type_data && tg.type_data.length > 0) || tg.ts_id,
      );

      if (hasTypes && !sel.type) {
        return {
          itemTitle: item.item_title || selProd.prod_name,
          prodName: selProd.prod_name,
        };
      }
    }
    return null;
  }, [selectedDeal, dealSelections]);

  const confirmDealToCart = () => {
    if (!selectedDeal) {return;}
    const missingType = getMissingDealTypeItem();
    if (missingType) {
      Alert.alert(
        'Typ erforderlich',
        `Bitte wählen Sie einen Typ für "${missingType.itemTitle}" aus, bevor Sie das Deal in den Warenkorb legen.`,
      );
      return;
    }
    addDealToCart(selectedDeal, dealSelections, calculateDealTotal);
    setDealModalVisible(false);
    setSelectedDeal(null);
    setDealSelections({});
  };

  const confirmProductToCart = () => {
    if (!selectedProduct) {return;}
    if (selectedProduct.types && selectedProduct.types.length > 0 && !productSelectedType) {
      Alert.alert(
        'Typ erforderlich',
        'Bitte wählen Sie einen Typ aus, bevor Sie das Produkt in den Warenkorb legen.',
      );
      return;
    }
    const addonsArray = (selectedProduct.addons || [])
      .filter(a => (productAddonQtys[a.as_id] || 0) > 0)
      .map(a => ({
        ...a,
        quantity: productAddonQtys[a.as_id],
      }));

    addToCart(
      selectedProduct,
      addonsArray,
      productSelectedType,
      productSelectedDressings,
      modalTotal,
    );
  };

  const addToCart = (product, addons = [], type = null, dressings = [], customUnitPrice = null) => {
    const unitPrice = customUnitPrice || (parseFloat(product.price) || 0).toFixed(2);
    const existingIndex = cartItems.findIndex(
      item =>
        !item.product?.isDeal &&
        String(item.product?.id) === String(product.id) &&
        item.type?.ts_id === type?.ts_id &&
        JSON.stringify(item.dressings || item.dressing || []) === JSON.stringify(dressings || []) &&
        JSON.stringify(item.addons || []) === JSON.stringify(addons || []),
    );

    if (existingIndex > -1) {
      const nextCart = [...cartItems];
      const existing = nextCart[existingIndex];
      const newQty = (existing.quantity || 1) + 1;
      nextCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: (parseFloat(existing.unitPrice) * newQty).toFixed(2),
      };
      saveCart(nextCart);
    } else {
      const newItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        product,
        addons: addons || [],
        type,
        dressings: dressings || [],
        dressing: dressings?.[0] || null,
        quantity: 1,
        unitPrice: String(unitPrice),
        totalPrice: String(unitPrice),
      };

      const nextCart = [...cartItems, newItem];
      saveCart(nextCart);
    }

    setInputVal('');
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const updateQuantity = (id, delta) => {
    const nextCart = cartItems
      .map(item => {
        if (item.id !== id) {return item;}
        const newQty = (item.quantity || 1) + delta;
        if (newQty < 1) {return null;}
        const total = (parseFloat(item.unitPrice) * newQty).toFixed(2);
        return { ...item, quantity: newQty, totalPrice: total };
      })
      .filter(Boolean);
    saveCart(nextCart);
  };

  const deleteCartItem = (id) => {
    const nextCart = cartItems.filter(item => item.id !== id);
    saveCart(nextCart);
  };

  const clearCart = () => {
    if (cartItems.length === 0) {return;}
    Alert.alert(
      selectedTable ? `Tisch ${selectedTable.table_name} leeren` : 'Warenkorb leeren',
      selectedTable
        ? 'Möchten Sie alle Artikel entfernen und diesen Tisch freigeben?'
        : 'Möchten Sie alle Artikel entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            if (selectedTable) {
              await clearTableOrder(selectedTable.id);
              saveCart([]);
              setSelectedTable(prev => (prev ? { ...prev, status: 'available', occupied_at: null } : null));
              setTables(prev =>
                prev.map(t =>
                  String(t.id) === String(selectedTable.id)
                    ? { ...t, status: 'available', occupied_at: null }
                    : t,
                ),
              );
            } else {
              saveCart([]);
            }
          },
        },
      ],
    );
  };

  const getTableOrderSummary = (tableId) => {
    if (selectedTable && String(selectedTable.id) === String(tableId) && cartItems.length > 0) {
      const count = cartItems.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
      const total = cartItems.reduce((sum, it) => {
        const p = parseFloat(it.totalPrice || it.unitPrice || it.product?.price) || 0;
        return sum + p;
      }, 0);
      return {
        priceFormatted: `${total.toFixed(2).replace('.', ',')} €`,
        count,
        items: cartItems,
      };
    }

    const order = tableOrders.find(o => String(o.tbl_id) === String(tableId));
    if (!order || !order.order_details) {
      return { priceFormatted: '0,00 €', count: 0, items: [] };
    }
    try {
      const items = typeof order.order_details === 'string' ? JSON.parse(order.order_details) : order.order_details;
      if (!Array.isArray(items) || items.length === 0) {
        return { priceFormatted: '0,00 €', count: 0, items: [] };
      }
      const count = items.reduce((sum, it) => sum + (Number(it.quantity || it.qty || it.deal_qty) || 1), 0);
      const total = items.reduce((sum, it) => {
        const p = parseFloat(it.priceWithAddons || it.custom_price || it.customPrice || it.deal_price || it.price || it.cost) || 0;
        const q = Number(it.quantity || it.qty || it.deal_qty) || 1;
        return sum + p * q;
      }, 0);
      return {
        priceFormatted: `${total.toFixed(2).replace('.', ',')} €`,
        count,
        items,
      };
    } catch (e) {
      return { priceFormatted: '0,00 €', count: 0, items: [] };
    }
  };

  const handleSelectTable = (table) => {
    if (selectedTable?.id === table.id) {
      handleClearSelectedTable();
      setTablesModalVisible(false);
      return;
    }

    setSelectedTable(table);
    setTablesModalVisible(false);

    const order = tableOrders.find(o => String(o.tbl_id) === String(table.id));
    let items = [];
    if (order && order.order_details) {
      try {
        items = typeof order.order_details === 'string' ? JSON.parse(order.order_details) : order.order_details;
      } catch (e) {
        items = [];
      }
    }

    if (Array.isArray(items) && items.length > 0) {
      const convertedCart = items.map((it, idx) => ({
        id: `${Date.now()}_${idx}_${it.id || it.sku_id || Math.random()}`,
        product: {
          id: it.id,
          name: it.name || it.deal_name || 'Item',
          price: String(it.price || it.cost || it.deal_price || '0.00'),
          img: it.img || it.deal_image || '',
          sku_id: it.sku_id,
          category_id: it.category_id,
          sub_category_id: it.sub_category_id,
          isDeal: it.for_deal_only === '1' || it.isDeal || it.is_deal === 'yes',
        },
        addons: it.addons || [],
        type: it.types?.[0] || it.type || null,
        dressing: it.dressings?.[0] || it.dressing || null,
        quantity: Number(it.quantity || it.qty || it.deal_qty) || 1,
        unitPrice: (parseFloat(it.priceWithAddons || it.custom_price || it.customPrice || it.deal_price || it.price) || 0).toFixed(2),
        totalPrice: ((parseFloat(it.priceWithAddons || it.custom_price || it.customPrice || it.deal_price || it.price) || 0) * (Number(it.quantity || it.qty || it.deal_qty) || 1)).toFixed(2),
        rawTableItem: it,
      }));
      setCartItems(convertedCart);
    } else {
      setCartItems([]);
    }
  };

  const handleClearSelectedTable = () => {
    if (!selectedTable) {return;}
    const isOccupied = selectedTable.status?.toLowerCase() === 'occupied' || cartItems.length > 0;
    if (isOccupied) {
      Alert.alert(
        `Tisch "${selectedTable.table_name}"`,
        'Was möchten Sie tun?',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Nur abwählen',
            onPress: () => {
              setSelectedTable(null);
              setCartItems([]);
              loadSavedCart();
            },
          },
          {
            text: 'Tisch freigeben (Reset)',
            style: 'destructive',
            onPress: async () => {
              try {
                await clearTableOrder(selectedTable.id);
                setSelectedTable(null);
                setCartItems([]);
                loadSavedCart();
                Alert.alert('Erfolg', `Tisch "${selectedTable.table_name}" wurde freigegeben.`);
              } catch (e) {
                Alert.alert('Fehler', 'Tisch konnte nicht freigegeben werden.');
              }
            },
          },
        ],
      );
    } else {
      setSelectedTable(null);
      setCartItems([]);
      loadSavedCart();
    }
  };

  const openTablesModal = () => {
    fetchTablesData();
    setTablesModalVisible(true);
  };

  const handleStreetSearch = (text) => {
    setStreetQuery(text);
    if (!text || text.trim().length < 2) {
      setStreetSuggestions([]);
      return;
    }
    if (streetSearchTimeoutRef.current) {
      clearTimeout(streetSearchTimeoutRef.current);
    }
    streetSearchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearchingStreet(true);
        const postalCode = selectedArea?.postal_code || '';
        const query = postalCode ? `${text.trim()} - ${postalCode}` : text.trim();
        const res = await fetch(
          `https://eu1.locationiq.com/v1/autocomplete?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=de`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter and map — same as foodola-pos
          const filtered = data
            .filter(e => !!e.address?.road || !!e.address?.name)
            .map(place => {
              const road = place.address?.road ?? place.address?.name ?? '';
              const houseNo = place.address?.house_number ?? '';
              return { ...place, _road: road, _houseNo: houseNo };
            });
          setStreetSuggestions(filtered);
        } else {
          setStreetSuggestions([]);
        }
      } catch (err) {
        setStreetSuggestions([]);
      } finally {
        setIsSearchingStreet(false);
      }
    }, 500);
  };

  const handleSelectStreet = (suggestion) => {
    const streetName = suggestion._road || suggestion.address?.road || suggestion.address?.name || suggestion.display_name?.split(',')?.[0] || suggestion.display_name;
    setStreetQuery(streetName);
    if (suggestion._houseNo) {
      setHouseNo(suggestion._houseNo);
    }
    setStreetSuggestions([]);
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
    (selectedProduct.addons || []).forEach(a => {
      const q = productAddonQtys[a.as_id] || 0;
      sum += (parseFloat(a.as_price) || 0) * q;
    });
    if (productSelectedType) {
      sum += parseFloat(productSelectedType.price) || 0;
    }
    (productSelectedDressings || []).forEach(d => {
      sum += parseFloat(d.price) || 0;
    });
    return sum.toFixed(2);
  }, [selectedProduct, productAddonQtys, productSelectedType, productSelectedDressings]);

  const calculateDeliveryCostFn = useCallback((area, amount) => {
    const minOrderPrice = Number(area?.min_order_price) || 0;
    const discountedDeliveryAmount = Number(area?.discounted_delivery_amount) || 0;
    const minimumOrderShortfall = Math.max(minOrderPrice - Number(amount), 0);
    return (minimumOrderShortfall + discountedDeliveryAmount).toFixed(2);
  }, []);

  const calculateItemDetails = useCallback((item, discount = 0, orderTotal = 0) => {
    const isDeal = item.is_deal === 'yes' || item.isDeal || item.product?.isDeal;

    if (isDeal) {
      let total = parseFloat(item.unitPrice || item.product?.price || item.deal_price || 0);
      let addonTotal = 0;
      let dressingsTotal = 0;
      let typesTotal = 0;

      const dealItemsList = item.deal_items || [];
      dealItemsList.forEach(dItem => {
        const productsList = dItem.items_products || [];
        productsList.forEach(prod => {
          (prod.types || []).forEach(t => {
            typesTotal += parseFloat(t?.price || 0);
          });
          (prod.dressing || []).forEach(d => {
            dressingsTotal += parseFloat(d?.price || 0);
          });
          const addons = prod.addons || [];
          let remainingFree = parseInt(dItem.num_of_free_items, 10) || 0;
          addons.forEach(a => {
            const qty = Number(a.quantity || 0);
            const price = parseFloat(a.as_price || 0);
            const isFree = String(a.isFreeInDeal) === '1' || a.isFreeInDeal === 1;
            if (isFree && remainingFree > 0) {
              if (qty <= remainingFree) {
                remainingFree -= qty;
              } else {
                const paidQty = qty - remainingFree;
                addonTotal += paidQty * price;
                remainingFree = 0;
              }
            } else {
              addonTotal += qty * price;
            }
          });
        });
      });

      const rawDealTax = item.tax ?? item.product?.tax;
      const tax = (rawDealTax === null || rawDealTax === '' || rawDealTax === undefined)
        ? 7
        : Number(rawDealTax);
      let taxAmt = 0;
      if (tax > 0) {
        taxAmt = Number((total - total / (1 + tax / 100)).toFixed(5));
      }

      const qty = Number(item.quantity || 1);
      return {
        itemTotal: total,
        addonTotal,
        dressingsTotal,
        typesTotal,
        subtotal: total * qty,
        taxAmt,
        tax,
        quantity: qty,
        isDeal: true,
      };
    }

    const basePrice = parseFloat(item.product?.price || item.price || 0);
    let total = basePrice;
    let addonTotal = 0;
    (item.addons || []).forEach(a => {
      addonTotal += parseFloat(a.as_price || 0) * (Number(a.quantity) || 1);
    });
    let dressingsTotal = 0;
    (item.dressings || (item.dressing ? [item.dressing] : [])).forEach(d => {
      dressingsTotal += parseFloat(d.price || 0);
    });
    let typesTotal = 0;
    (item.types || (item.type ? [item.type] : [])).forEach(t => {
      typesTotal += parseFloat(t.price || 0);
    });

    total = total + addonTotal + dressingsTotal + typesTotal;

    const tax = Number(item.tax || item.product?.tax || 0);
    let taxAmt = 0;
    if (tax > 0) {
      if (discount > 0 && orderTotal > 0) {
        const discountedPerItem = total - (total / orderTotal) * discount;
        taxAmt = Number((discountedPerItem - discountedPerItem / (1 + tax / 100)).toFixed(5));
      } else {
        taxAmt = Number((total - total / (1 + tax / 100)).toFixed(5));
      }
    }

    const qty = Number(item.quantity || 1);
    return {
      itemTotal: total,
      addonTotal,
      dressingsTotal,
      typesTotal,
      subtotal: total * qty,
      taxAmt,
      tax,
      quantity: qty,
      isDeal: false,
    };
  }, []);

  const rawCartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const details = calculateItemDetails(item);
      return acc + details.subtotal;
    }, 0);
  }, [cartItems, calculateItemDetails]);

  const toggleShipping = () => {
    if (!isShippingEnabled) {
      if (!selectedArea) {
        Alert.alert(
          'Postleitzahl fehlt',
          'Bitte wählen Sie zuerst eine Postleitzahl / ein Liefergebiet aus.',
        );
        return;
      }
      setIsShippingEnabled(true);
      const cost = calculateDeliveryCostFn(selectedArea, rawCartTotal);
      setShippingCost(cost);
    } else {
      setIsShippingEnabled(false);
      setShippingCost('0.00');
    }
  };

  useEffect(() => {
    if (isShippingEnabled && selectedArea) {
      setShippingCost(calculateDeliveryCostFn(selectedArea, rawCartTotal));
    }
  }, [isShippingEnabled, selectedArea, rawCartTotal, calculateDeliveryCostFn]);

  const { nettoTotal, mettoTotal } = useMemo(() => {
    const additionalDisc = parseFloat(additionalDiscount) || 0;
    const orderTotal = rawCartTotal;

    const netto = Number(
      cartItems
        .filter(item => {
          const isDealItem = item.is_deal === 'yes' || item.isDeal || item.product?.isDeal;
          const rawTax = item.tax ?? item.product?.tax;
          const effectiveTax = isDealItem && (rawTax === null || rawTax === '' || rawTax === undefined)
            ? 7
            : Number(rawTax || 0);
          return effectiveTax === 7;
        })
        .reduce((total, item) => {
          const calc = calculateItemDetails(item, additionalDisc, orderTotal);
          return additionalDisc <= orderTotal ? total + calc.taxAmt * calc.quantity : 0;
        }, 0)
        .toFixed(2),
    );

    let metto = Number(
      cartItems
        .filter(item => Number(item.tax || item.product?.tax) === 19)
        .reduce((total, item) => {
          const calc = calculateItemDetails(item, additionalDisc, orderTotal);
          return additionalDisc <= orderTotal ? total + calc.taxAmt * calc.quantity : 0;
        }, 0)
        .toFixed(2),
    );

    if (isShippingEnabled && parseFloat(shippingCost) > 0) {
      const ship = parseFloat(shippingCost);
      const shipTax = ship - ship / 1.19;
      metto = Number((metto + shipTax).toFixed(2));
    }

    return { nettoTotal: netto.toFixed(2), mettoTotal: metto.toFixed(2) };
  }, [cartItems, additionalDiscount, rawCartTotal, isShippingEnabled, shippingCost, calculateItemDetails]);

  const grandTotal = useMemo(() => {
    const ship = isShippingEnabled ? (parseFloat(shippingCost) || 0) : 0;
    const disc = parseFloat(additionalDiscount) || 0;
    const finalAmt = Math.max(0, rawCartTotal + ship - (disc <= rawCartTotal ? disc : 0));
    return finalAmt.toFixed(2);
  }, [rawCartTotal, isShippingEnabled, shippingCost, additionalDiscount]);

  const isInvalidDiscount = useMemo(() => {
    const disc = parseFloat(additionalDiscount) || 0;
    return disc > rawCartTotal && rawCartTotal > 0;
  }, [additionalDiscount, rawCartTotal]);

  const categoryTabs = useMemo(() => {
    const base = subcategories.length > 0 ? subcategories : categories;
    return [{ id: 'deals_tab', name: 'Deals', isDealsTab: true }, ...base];
  }, [subcategories, categories]);

  const displayedItems = useMemo(() => {
    if (activeCategory?.isDealsTab) {
      return deals;
    }
    if (!activeCategory) {return products;}
    return products.filter(
      p =>
        String(p.category_id) === String(activeCategory.id) ||
        String(p.sub_category_id) === String(activeCategory.id),
    );
  }, [activeCategory, deals, products]);

  const row1Products = useMemo(
    () => displayedItems.filter((_, idx) => idx % 2 === 0),
    [displayedItems],
  );
  const row2Products = useMemo(
    () => displayedItems.filter((_, idx) => idx % 2 !== 0),
    [displayedItems],
  );

  const renderTableCard = (table) => {
    return (
      <TableCardItem
        key={table.id}
        table={table}
        isSelected={selectedTable?.id === table.id}
        onSelect={handleSelectTable}
        orderSummary={getTableOrderSummary(table.id)}
        baseUrl={baseUrl}
      />
    );
  };

  const renderProductCard = (product) => {
    const imgUri = getDynamicImageUrl(product.img, baseUrl);
    const imageSource = imgUri ? { uri: imgUri } : null;

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        activeOpacity={0.7}
        onPress={() => handleProductSelection(product)}>
        {product.isDeal && (
          <View style={styles.dealBadge}>
            <Text style={styles.dealBadgeText}>DEAL</Text>
          </View>
        )}
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.productThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailFallback}>
            <MaterialCommunityIcons
              name={product.isDeal ? 'tag-outline' : 'silverware-fork-knife'}
              size={24}
              color="#bbb"
            />
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
  };

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
        <TouchableOpacity
          style={[styles.headerItem, selectedTable && styles.headerItemTableActive]}
          onPress={openTablesModal}>
          <MaterialCommunityIcons
            name="table-chair"
            size={19}
            color={selectedTable ? '#e53935' : '#333'}
          />
          <Text
            style={[
              styles.headerItemText,
              selectedTable && styles.headerItemTextTableActive,
            ]}>
            {selectedTable ? selectedTable.table_name : 'Select Table'}
          </Text>
          {selectedTable && (
            <TouchableOpacity
              onPress={handleClearSelectedTable}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.tableClearBtn}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#e53935" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {!selectedTable && (
          <TouchableOpacity
            style={styles.headerItemOrderType}
            onPress={() => setOrderDetailsVisible(true)}>
            <MaterialCommunityIcons
              name={orderType === 'delivery' ? 'truck-delivery' : 'walk'}
              size={18}
              color="#d32f2f"
            />
            <Text style={styles.headerItemOrderTypeText}>
              {orderType === 'delivery' ? 'Delivery' : 'Pickup'}
            </Text>
          </TouchableOpacity>
        )}

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
          <>
            {/* Foodola-style Cart Header */}
            <View style={styles.cartHeaderBar}>
              <View style={styles.cartHeaderLeft}>
                <MaterialCommunityIcons name="cart-outline" size={19} color="#0f172a" />
                <Text style={styles.cartHeaderTitle}>Warenkorb</Text>
                {cartItems.length > 0 && (
                  <View style={styles.cartCountBadge}>
                    <Text style={styles.cartCountBadgeText}>{cartItems.length}</Text>
                  </View>
                )}
              </View>
              {cartItems.length > 0 && (
                <TouchableOpacity
                  style={styles.cartClearBtn}
                  onPress={clearCart}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <MaterialCommunityIcons name="trash-can-outline" size={14} color="#dc2626" />
                  <Text style={styles.cartClearBtnText}>Leeren</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={cartItems}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.cartListContent}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const imgUri = getDynamicImageUrl(item.product?.img, baseUrl);
                const imgSource = imgUri ? { uri: imgUri } : null;

                const isDealItem = item.product?.isDeal || item.isDeal;
                const hasDealCustoms = isDealItem && item.deal_items && item.deal_items.length > 0;
                const hasProdCustoms =
                  !isDealItem &&
                  Boolean(
                    item.type ||
                    (item.dressings && item.dressings.length > 0) ||
                    item.dressing ||
                    (item.addons && item.addons.length > 0)
                  );
                const hasCustoms = hasDealCustoms || hasProdCustoms;

                return (
                  <View style={styles.cartCard}>
                    {/* Top Row: Thumbnail + Title & Unit Price + Subtotal */}
                    <View style={styles.cartCardTop}>
                      {imgSource ? (
                        <Image source={imgSource} style={styles.cartItemThumb} />
                      ) : (
                        <View style={styles.cartItemThumbFallback}>
                          <MaterialCommunityIcons
                            name={isDealItem ? 'tag-multiple-outline' : 'food-outline'}
                            size={18}
                            color="#64748b"
                          />
                        </View>
                      )}

                      <View style={styles.cartCardHeadInfo}>
                        <Text style={styles.cartItemName} numberOfLines={2}>
                          {item.product?.name || item.deal_name}
                        </Text>
                        <Text style={styles.cartItemUnitPrice}>
                          €{item.unitPrice || item.product?.price} × {item.quantity || 1}
                        </Text>
                      </View>

                      <View style={styles.cartCardPriceWrap}>
                        <Text style={styles.cartItemSubtotal}>
                          €{item.totalPrice || item.unitPrice}
                        </Text>
                      </View>
                    </View>

                    {/* Middle: Full-width Customizations */}
                    {hasCustoms && (
                      <View style={styles.cartCustomizationsBox}>
                        {isDealItem ? (
                          <View style={styles.dealSubDetails}>
                            {(item.deal_items || []).map((di, diIdx) => {
                              const p = di.items_products?.[0];
                              if (!p) {return null;}
                              return (
                                <View key={diIdx} style={styles.dealSubProdBlock}>
                                  <Text style={styles.dealProdTitle}>• {p.prod_name}</Text>
                                  {p.types?.map(t => (
                                    <Text key={t.ts_id} style={styles.cartItemSub}>
                                      + {t.ts_name} {parseFloat(t.price) > 0 ? `(+€${parseFloat(t.price).toFixed(2)})` : ''}
                                    </Text>
                                  ))}
                                  {p.dressing?.map(d => (
                                    <Text key={d.ds_id} style={styles.cartItemSub}>
                                      + {d.dressing_name} {parseFloat(d.price) > 0 ? `(+€${parseFloat(d.price).toFixed(2)})` : ''}
                                    </Text>
                                  ))}
                                  {(p.addons || []).map((a, aIdx) => (
                                    <Text key={a.as_id || aIdx} style={styles.cartItemSub}>
                                      + {a.as_name} - €{parseFloat(a.as_price || 0).toFixed(2)} × {a.quantity || 1}
                                    </Text>
                                  ))}
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.dealSubDetails}>
                            {item.type && (
                              <Text style={styles.cartItemSub}>
                                • {item.type.type_title || 'Typ'}: {item.type.ts_name}{' '}
                                {parseFloat(item.type.price) > 0 ? `(+€${parseFloat(item.type.price).toFixed(2)})` : ''}
                              </Text>
                            )}
                            {(item.dressings || (item.dressing ? [item.dressing] : [])).map(d => (
                              <Text key={d.ds_id} style={styles.cartItemSub}>
                                • Dressing: {d.dressing_name} {parseFloat(d.price) > 0 ? `(+€${parseFloat(d.price).toFixed(2)})` : ''}
                              </Text>
                            ))}
                            {(item.addons || []).map(a => (
                              <Text key={a.as_id} style={styles.cartItemSub}>
                                + {a.as_name} - €{parseFloat(a.as_price || 0).toFixed(2)} × {a.quantity || 1}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {/* Bottom Action Row: Stepper [- QTY +] on left, Trash on right */}
                    <View style={styles.cartCardBottom}>
                      <View style={styles.cartStepperWrap}>
                        <TouchableOpacity
                          style={styles.cartStepperBtnMinus}
                          onPress={() => updateQuantity(item.id, -1)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <MaterialCommunityIcons name="minus" size={15} color="#334155" />
                        </TouchableOpacity>
                        <Text style={styles.cartStepperQty}>{item.quantity || 1}</Text>
                        <TouchableOpacity
                          style={styles.cartStepperBtnPlus}
                          onPress={() => updateQuantity(item.id, 1)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <MaterialCommunityIcons name="plus" size={15} color="#fff" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => deleteCartItem(item.id)}
                        style={styles.cartRemoveBtn}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.cartEmptyWrap}>
                  <View style={styles.cartEmptyIconCircle}>
                    <MaterialCommunityIcons name="cart-outline" size={32} color="#94a3b8" />
                  </View>
                  <Text style={styles.cartEmptyTitle}>Warenkorb ist leer</Text>
                  <Text style={styles.cartEmptySubtitle}>Artikel auswählen oder Numpad eingeben</Text>
                </View>
              }
            />

            {/* Cart Summary Footer */}
            {cartItems.length > 0 && (
              <View style={styles.cartSummaryFooter}>
                {/* Row 1: Taxes side-by-side */}
                <View style={styles.summaryDualRow}>
                  <View style={styles.summaryDualCol}>
                    <Text style={styles.summaryRowLabel}>MwSt. (7%):</Text>
                    <Text style={styles.summaryRowVal}>€{nettoTotal}</Text>
                  </View>
                  <View style={styles.summaryDualCol}>
                    <Text style={styles.summaryRowLabel}>MwSt. (19%):</Text>
                    <Text style={styles.summaryRowVal}>€{mettoTotal}</Text>
                  </View>
                </View>

                {/* Row 2: Discount & Shipping side-by-side */}
                <View style={styles.summaryDualRow}>
                  <View style={styles.summaryDualCol}>
                    <View style={styles.discountRow}>
                      <Text style={styles.summaryRowLabel}>Rabatt:</Text>
                      <View style={[styles.discountInputWrap, isInvalidDiscount && styles.inputErrorBorder]}>
                        <TextInput
                          style={styles.discountInput}
                          placeholder="0.00"
                          placeholderTextColor="#999"
                          keyboardType="decimal-pad"
                          returnKeyType="done"
                          selectTextOnFocus
                          value={additionalDiscount}
                          onChangeText={setAdditionalDiscount}
                          onSubmitEditing={Keyboard.dismiss}
                        />
                        <Text style={styles.euroUnit}>€</Text>
                      </View>
                    </View>
                    {isInvalidDiscount && (
                      <Text style={styles.discountErrorText}>
                        Max. €{rawCartTotal.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.summaryDualCol}>
                    <TouchableOpacity
                      style={styles.shippingCheckboxRow}
                      onPress={toggleShipping}
                      activeOpacity={0.7}>
                      <View style={[styles.checkSquare, isShippingEnabled && styles.checkSquareActive]}>
                        {isShippingEnabled && (
                          <MaterialCommunityIcons name="check" size={11} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.shippingCheckboxLabel}>Lieferung:</Text>
                    </TouchableOpacity>
                    {isShippingEnabled ? (
                      <View style={styles.shippingInputWrap}>
                        <TextInput
                          style={styles.shippingInput}
                          placeholder="0.00"
                          placeholderTextColor="#999"
                          keyboardType="decimal-pad"
                          returnKeyType="done"
                          selectTextOnFocus
                          value={shippingCost}
                          onChangeText={setShippingCost}
                          onSubmitEditing={Keyboard.dismiss}
                        />
                        <Text style={styles.euroUnit}>€</Text>
                      </View>
                    ) : (
                      <Text style={styles.summaryRowVal}>€0.00</Text>
                    )}
                  </View>
                </View>

                {/* Row 3: Payment Buttons & Grand Total */}
                <View style={styles.summaryBottomRow}>
                  <View style={styles.paymentTypeRow}>
                    <TouchableOpacity
                      style={[styles.paymentTypeBtn, paymentType === 'cash' && styles.paymentTypeBtnActive]}
                      onPress={() => setPaymentType('cash')}>
                      <MaterialCommunityIcons
                        name="cash"
                        size={14}
                        color={paymentType === 'cash' ? '#fff' : '#444'}
                      />
                      <Text style={[styles.paymentTypeBtnText, paymentType === 'cash' && styles.paymentTypeBtnTextActive]}>
                        Cash
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.paymentTypeBtn, paymentType === 'online' && styles.paymentTypeBtnActive]}
                      onPress={() => setPaymentType('online')}>
                      <MaterialCommunityIcons
                        name="credit-card-outline"
                        size={14}
                        color={paymentType === 'online' ? '#fff' : '#444'}
                      />
                      <Text style={[styles.paymentTypeBtnText, paymentType === 'online' && styles.paymentTypeBtnTextActive]}>
                        Online
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.grandTotalWrap}>
                    <Text style={styles.grandTotalLabel}>Total: </Text>
                    <Text style={styles.grandTotalVal}>€{grandTotal}</Text>
                  </View>
                </View>
              </View>
            )}
          </>
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
            {displayedItems.length === 0 ? (
              <View style={styles.emptyProducts}>
                <Text style={styles.emptyProductsText}>Keine Produkte gefunden</Text>
              </View>
            ) : (
              <View style={styles.productRowsContainer}>
                <FlatList
                  horizontal
                  data={row1Products}
                  keyExtractor={item => String(item.id)}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productRowScroll}
                  renderItem={({ item }) => renderProductCard(item)}
                />
                {row2Products.length > 0 && (
                  <FlatList
                    horizontal
                    data={row2Products}
                    keyExtractor={item => String(item.id)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productRowScroll}
                    renderItem={({ item }) => renderProductCard(item)}
                  />
                )}
              </View>
            )}
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
            <TouchableOpacity
              style={[styles.bottomBtn, styles.greenBtn, isPlacingOrder && styles.btnDisabled]}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
              activeOpacity={0.7}>
              {isPlacingOrder
                ? <ActivityIndicator size="small" color="#fff" />
                : <MaterialCommunityIcons name="cash-register" size={23} color="#fff" />
              }
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
                    {selectedProduct.types[0]?.type_title_user || selectedProduct.types[0]?.type_title || 'Types'}
                    <Text style={styles.requiredStar}> * (Pflicht)</Text>
                  </Text>
                  {selectedProduct.types.map(t => (
                    <TouchableOpacity
                      key={t.ts_id}
                      style={styles.optionItem}
                      activeOpacity={0.7}
                      onPress={() => setProductSelectedType(t)}>
                      <View style={styles.radioBorder}>
                        {productSelectedType?.ts_id === t.ts_id && (
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
                    {selectedProduct.dressings[0]?.dressing_title_user || selectedProduct.dressings[0]?.dressing_title || 'Dressings'}
                  </Text>
                  {selectedProduct.dressings.map(d => {
                    const isChecked = productSelectedDressings.some(x => x.ds_id === d.ds_id);
                    return (
                      <TouchableOpacity
                        key={d.ds_id}
                        style={styles.optionItem}
                        activeOpacity={0.7}
                        onPress={() => toggleProductDressing(d)}>
                        <View style={[styles.checkSquare, isChecked && styles.checkSquareActive]}>
                          {isChecked && (
                            <MaterialCommunityIcons name="check" size={14} color="#fff" />
                          )}
                        </View>
                        <Text style={styles.optionLabel}>{d.dressing_name}</Text>
                        {parseFloat(d.price) > 0 && (
                          <Text style={styles.optionCharge}>
                            +€{parseFloat(d.price).toFixed(2)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {selectedProduct?.addons?.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={styles.optionSectionTitle}>
                    {selectedProduct.addons[0]?.ao_title || 'Addons'}
                  </Text>
                  {selectedProduct.addons.map(a => {
                    const curQty = productAddonQtys[a.as_id] || 0;
                    return (
                      <View key={a.as_id} style={styles.dealAddonRow}>
                        <View style={styles.dealAddonLabelWrap}>
                          <Text style={styles.optionLabel}>{a.as_name}</Text>
                          <Text style={styles.optionCharge}>
                            +€{parseFloat(a.as_price || 0).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.addonStepper}>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => updateProductAddonQty(a, -1)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Text style={styles.stepperBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.stepperQty}>{curQty}</Text>
                          <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => updateProductAddonQty(a, 1)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                            <Text style={styles.stepperBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
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
                style={[
                  styles.submitBtn,
                  selectedProduct?.types?.length > 0 && !productSelectedType && styles.submitBtnDisabled,
                ]}
                activeOpacity={0.8}
                onPress={confirmProductToCart}>
                <Text style={styles.submitBtnText}>Add to Cart - €{modalTotal}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={dealModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setDealModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeadline} numberOfLines={1}>
                {selectedDeal?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setDealModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={styles.modalContentInner}
              showsVerticalScrollIndicator={true}>
              {(selectedDeal?.deal_items || []).map(item => {
                const sel = dealSelections[item.item_id] || {};
                const selProd = sel.prod;
                return (
                  <View key={item.item_id} style={styles.dealSectionBlock}>
                    <Text style={styles.dealSectionTitle}>{item.item_title}</Text>

                    {(item.items_products || []).length > 1 && (item.items_products || []).map(p => (
                      <TouchableOpacity
                        key={p.prod_id}
                        style={styles.optionItem}
                        activeOpacity={0.7}
                        onPress={() => setDealItemProd(item.item_id, p)}>
                        <View style={styles.radioBorder}>
                          {selProd?.prod_id === p.prod_id && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text style={styles.optionLabel}>{p.prod_name}</Text>
                      </TouchableOpacity>
                    ))}

                    {(item.items_products || []).length === 1 && (
                      <Text style={styles.dealSingleProd}>
                        • {item.items_products[0].prod_name}
                      </Text>
                    )}

                    {(selProd?.types || []).map(typeGroup => (
                      typeGroup.type_data?.length > 0 && (
                        <View key={typeGroup.type_id} style={styles.dealSubSection}>
                          <Text style={styles.dealSubSectionTitle}>
                            {typeGroup.type_title || 'Types'}
                            <Text style={styles.requiredStar}> * (Pflicht)</Text>
                          </Text>
                          {typeGroup.type_data.map(t => (
                            <TouchableOpacity
                              key={t.ts_id}
                              style={styles.optionItem}
                              activeOpacity={0.7}
                              onPress={() => setDealItemType(item.item_id, t)}>
                              <View style={styles.radioBorder}>
                                {sel.type?.ts_id === t.ts_id && (
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
                      )
                    ))}

                    {(selProd?.dressing || []).map(dressingGroup => (
                      dressingGroup.dressing_data?.length > 0 && (
                        <View key={dressingGroup.dressing_id} style={styles.dealSubSection}>
                          <Text style={styles.dealSubSectionTitle}>
                            {dressingGroup.dressing_title || 'Dressing'}
                          </Text>
                          {dressingGroup.dressing_data.map(d => (
                            <TouchableOpacity
                              key={d.ds_id}
                              style={styles.optionItem}
                              activeOpacity={0.7}
                              onPress={() => setDealItemDressing(item.item_id, d)}>
                              <View style={styles.radioBorder}>
                                {sel.dressing?.ds_id === d.ds_id && (
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
                      )
                    ))}

                    {(selProd?.addons || []).map(addonGroup => (
                      addonGroup.ao_data?.length > 0 && (
                        <View key={addonGroup.ao_id} style={styles.dealSubSection}>
                          <View style={styles.dealAddonHeaderRow}>
                            <Text style={styles.dealSubSectionTitle}>
                              {addonGroup.ao_title || 'Addons'}
                            </Text>
                            {parseInt(item.num_of_free_items, 10) > 0 && (
                              <View style={styles.freeItemsBadge}>
                                <Text style={styles.freeItemsBadgeText}>
                                  {item.num_of_free_items} FREE
                                </Text>
                              </View>
                            )}
                          </View>
                          {addonGroup.ao_data.map(a => {
                            const curQty = (sel.addons && sel.addons[a.as_id]?.quantity) || 0;
                            const isFree = String(a.isFreeInDeal) === '1' || a.isFreeInDeal === 1;
                            return (
                              <View key={a.as_id} style={styles.dealAddonRow}>
                                <View style={styles.dealAddonLabelWrap}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                                    <Text style={styles.optionLabel}>{a.as_name}</Text>
                                    {isFree && (
                                      <View style={styles.freeBadgePill}>
                                        <Text style={styles.freeBadgePillText}>FREE</Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.optionCharge}>
                                    +€{parseFloat(a.as_price || 0).toFixed(2)}
                                  </Text>
                                </View>
                                <View style={styles.addonStepper}>
                                  <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => updateDealItemAddonQty(item.item_id, a, -1)}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                    <Text style={styles.stepperBtnText}>−</Text>
                                  </TouchableOpacity>
                                  <Text style={styles.stepperQty}>{curQty}</Text>
                                  <TouchableOpacity
                                    style={styles.stepperBtn}
                                    onPress={() => updateDealItemAddonQty(item.item_id, a, 1)}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                                    <Text style={styles.stepperBtnText}>+</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )
                    ))}
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalBottom}>
              <View>
                <Text style={styles.summaryLabel}>Gesamtpreis</Text>
                <Text style={styles.summaryPrice}>€{calculateDealTotal}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  Boolean(getMissingDealTypeItem()) && styles.submitBtnDisabled,
                ]}
                activeOpacity={0.8}
                onPress={confirmDealToCart}>
                <Text style={styles.submitBtnText}>Add to Cart - €{calculateDealTotal}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Details Modal (Pickup / Delivery) */}
      <Modal
        visible={orderDetailsVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOrderDetailsVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.orderDetailsBackdrop}>
          <View style={styles.orderDetailsSheet}>
            <View style={styles.orderDetailsHeader}>
              <Text style={styles.orderDetailsTitle}>Order Details</Text>
              <TouchableOpacity
                style={styles.orderDetailsCloseBtn}
                onPress={() => setOrderDetailsVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close" size={20} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.orderTypeSwitcher}>
              <TouchableOpacity
                style={[
                  styles.orderTypeTab,
                  orderType === 'pickup' && styles.orderTypeTabActive,
                ]}
                onPress={() => setOrderType('pickup')}>
                <MaterialCommunityIcons
                  name="walk"
                  size={18}
                  color={orderType === 'pickup' ? '#222' : '#666'}
                />
                <Text
                  style={[
                    styles.orderTypeTabText,
                    orderType === 'pickup' && styles.orderTypeTabTextActive,
                  ]}>
                  Pickup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.orderTypeTab,
                  orderType === 'delivery' && styles.orderTypeTabActive,
                ]}
                onPress={() => setOrderType('delivery')}>
                <MaterialCommunityIcons
                  name="truck-delivery"
                  size={18}
                  color={orderType === 'delivery' ? '#222' : '#666'}
                />
                <Text
                  style={[
                    styles.orderTypeTabText,
                    orderType === 'delivery' && styles.orderTypeTabTextActive,
                  ]}>
                  Delivery
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.formDropdown}
              onPress={() => setUserPickerVisible(!userPickerVisible)}>
              <Text
                style={[
                  styles.formDropdownText,
                  !selectedUser && styles.formDropdownPlaceholder,
                ]}
                numberOfLines={1}>
                {selectedUser
                  ? `${selectedUser.name}${selectedUser.phone ? ` (${selectedUser.phone})` : ''}`
                  : 'Select user...'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color="#666" />
            </TouchableOpacity>

            {userPickerVisible && (
              <View style={styles.dropdownPickerList}>
                <ScrollView nestedScrollEnabled style={styles.dropdownPickerScroll}>
                  {selectedUser && (
                    <TouchableOpacity
                      style={[styles.dropdownPickerItem, { backgroundColor: '#fef2f2' }]}
                      onPress={() => {
                        setSelectedUser(null);
                        setUserPickerVisible(false);
                      }}>
                      <Text style={[styles.dropdownPickerItemText, { color: '#ef4444', fontWeight: '600' }]}>
                        ✕ Gast / Kunde abwählen
                      </Text>
                    </TouchableOpacity>
                  )}
                  {users.map(u => (
                    <TouchableOpacity
                      key={u.id}
                      style={styles.dropdownPickerItem}
                      onPress={() => {
                        setSelectedUser(u);
                        setUserPickerVisible(false);
                        if (u.street && !streetQuery) {
                          setStreetQuery(u.street);
                        }
                        if (u.postal_code) {
                          const found = areas.find(a => String(a.postal_code) === String(u.postal_code));
                          if (found) {
                            setSelectedArea(found);
                          }
                        }
                        if (u.house_no && !houseNo) {
                          setHouseNo(u.house_no);
                        }
                      }}>
                      <Text style={styles.dropdownPickerItemText}>
                        {u.name} {u.phone ? `• ${u.phone}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {users.length === 0 && (
                    <Text style={styles.dropdownPickerEmpty}>Keine Benutzer gefunden</Text>
                  )}
                </ScrollView>
              </View>
            )}

            {orderType === 'delivery' && (
              <>
                <TouchableOpacity
                  style={styles.formDropdown}
                  onPress={() => setAreaPickerVisible(!areaPickerVisible)}>
                  <Text style={styles.formDropdownText} numberOfLines={1}>
                    {selectedArea ? selectedArea.postal_code : 'Select area...'}
                  </Text>
                  <MaterialCommunityIcons name="unfold-more-horizontal" size={20} color="#666" />
                </TouchableOpacity>

                {areaPickerVisible && (
                  <View style={styles.dropdownPickerList}>
                    <ScrollView nestedScrollEnabled style={styles.dropdownPickerScroll}>
                      {areas.map(a => (
                        <TouchableOpacity
                          key={a.id}
                          style={styles.dropdownPickerItem}
                          onPress={() => {
                            setSelectedArea(a);
                            setAreaPickerVisible(false);
                          }}>
                          <Text style={styles.dropdownPickerItemText}>
                            {a.postal_code}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {areas.length === 0 && (
                        <Text style={styles.dropdownPickerEmpty}>Keine Bereiche gefunden</Text>
                      )}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.streetInputWrap}>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Search streets..."
                    placeholderTextColor="#999"
                    value={streetQuery}
                    onChangeText={handleStreetSearch}
                  />
                  {isSearchingStreet && (
                    <ActivityIndicator size="small" color="#666" style={styles.streetSearchLoader} />
                  )}
                </View>

                {streetSuggestions.length > 0 && (
                  <View style={styles.streetSuggestionsList}>
                    {streetSuggestions.map(s => (
                      <TouchableOpacity
                        key={s.place_id || s.osm_id}
                        style={styles.streetSuggestionItem}
                        onPress={() => handleSelectStreet(s)}>
                        <MaterialCommunityIcons name="map-marker-outline" size={16} color="#d32f2f" />
                        <Text style={styles.streetSuggestionText} numberOfLines={1}>
                          {s._road || s.address?.road || s.address?.name || s.display_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TextInput
                  style={styles.formInput}
                  placeholder="House No"
                  placeholderTextColor="#999"
                  value={houseNo}
                  onChangeText={setHouseNo}
                />
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.orderDetailsSaveBtn, { flex: 1, backgroundColor: '#757575', marginTop: 0 }]}
                onPress={() => setOrderDetailsVisible(false)}>
                <Text style={styles.orderDetailsSaveBtnText}>Fertig</Text>
              </TouchableOpacity>
              {cartItems.length > 0 && (
                <TouchableOpacity
                  style={[styles.orderDetailsSaveBtn, { flex: 1, backgroundColor: '#4caf50', marginTop: 0 }, isPlacingOrder && styles.btnDisabled]}
                  onPress={handlePlaceOrder}
                  disabled={isPlacingOrder}>
                  {isPlacingOrder
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.orderDetailsSaveBtnText}>Place Order</Text>
                  }
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Tables Modal */}
      <Modal
        visible={tablesModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setTablesModalVisible(false)}>
        <View style={styles.tablesModalBackdrop}>
          <View style={styles.tablesModalSheet}>
            <View style={styles.tablesModalHeader}>
              <Text style={styles.tablesModalTitle}>Tables</Text>
              <View style={styles.tablesHeaderActions}>
                <TouchableOpacity
                  style={styles.tablesRefreshBtn}
                  onPress={() => fetchTablesData()}>
                  <MaterialCommunityIcons name="refresh" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tablesCloseBtn}
                  onPress={() => setTablesModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {loadingTables ? (
              <View style={styles.tablesLoaderWrap}>
                <ActivityIndicator size="large" color="#4caf50" />
              </View>
            ) : (
              <ScrollView
                style={styles.tablesScroll}
                contentContainerStyle={styles.tablesGrid}>
                {tables.map(tbl => renderTableCard(tbl))}
                {tables.length === 0 && (
                  <View style={styles.tablesEmptyWrap}>
                    <Text style={styles.tablesEmptyText}>Keine Tische gefunden</Text>
                  </View>
                )}
              </ScrollView>
            )}
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
    backgroundColor: '#f8fafc',
  },
  loaderWrap: {
    marginTop: 35,
    alignItems: 'center',
  },
  cartHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  cartCountBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  cartCountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  cartClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  cartClearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  cartListContent: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e8edf2',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1.5,
  },
  cartCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cartItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cartItemThumbFallback: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCardHeadInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 17,
  },
  cartItemUnitPrice: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  cartCardPriceWrap: {
    alignItems: 'flex-end',
    paddingLeft: 4,
  },
  cartItemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  cartCustomizationsBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dealSubDetails: {
    gap: 2,
  },
  dealSubProdBlock: {
    marginTop: 3,
  },
  dealProdTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  cartItemSub: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 8,
    lineHeight: 15,
  },
  cartCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  cartStepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  cartStepperBtnMinus: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  cartStepperQty: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  cartStepperBtnPlus: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
  },
  cartRemoveBtn: {
    width: 28,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartEmptyWrap: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartEmptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cartEmptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  cartEmptySubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
  },
  cartSummaryFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryDualRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  summaryDualCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountErrorText: {
    fontSize: 9,
    color: '#ef4444',
    marginTop: 1,
    marginLeft: 2,
  },
  summaryRowLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  summaryRowVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  discountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 68,
    height: 24,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
  },
  discountInput: {
    flex: 1,
    fontSize: 11,
    color: '#1e293b',
    paddingVertical: 0,
    textAlign: 'right',
  },
  shippingCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shippingCheckboxLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  shippingInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 68,
    height: 24,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 5,
  },
  shippingInput: {
    flex: 1,
    fontSize: 11,
    color: '#1e293b',
    paddingVertical: 0,
    textAlign: 'right',
  },
  euroUnit: {
    fontSize: 10,
    color: '#94a3b8',
    marginLeft: 2,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 6,
    marginTop: 2,
  },
  paymentTypeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  paymentTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  paymentTypeBtnActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  paymentTypeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  paymentTypeBtnTextActive: {
    color: '#fff',
  },
  grandTotalWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 4,
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
  },
  freeBadgePill: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  freeBadgePillText: {
    color: '#15803d',
    fontSize: 9,
    fontWeight: '700',
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
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
  btnDisabled: {
    opacity: 0.6,
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
    paddingVertical: 4,
  },
  productRowsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productRowScroll: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  productCard: {
    width: 140,
    height: 114,
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
    marginRight: 8,
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
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.75,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  requiredStar: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  dealItemIcon: {
    marginTop: 2,
  },
  dealItemContent: {
    flex: 1,
    marginLeft: 8,
  },
  dealItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  dealItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },
  dealItemProd: {
    fontSize: 12,
    color: '#555',
    marginTop: 1,
  },
  dealSectionBlock: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  dealSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#e53935',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dealSingleProd: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 6,
    paddingLeft: 4,
  },
  dealSubSection: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderColor: '#e0e0e0',
  },
  dealSubSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dealBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#e53935',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },
  dealBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Header Table & Order Type
  headerItemTableActive: {
    backgroundColor: '#ffebee',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerItemTextTableActive: {
    color: '#e53935',
    fontWeight: '700',
  },
  tableClearBtn: {
    marginLeft: 4,
  },
  headerItemOrderType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerItemOrderTypeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  // Order Details Modal (Image 1)
  orderDetailsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderDetailsSheet: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderDetailsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e53935',
  },
  orderDetailsCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  orderTypeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  orderTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
  },
  orderTypeTabActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderTypeTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  orderTypeTabTextActive: {
    color: '#111',
    fontWeight: '700',
  },
  formDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  formDropdownText: {
    fontSize: 15,
    color: '#222',
    flex: 1,
  },
  formDropdownPlaceholder: {
    color: '#999',
  },
  dropdownPickerList: {
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  dropdownPickerScroll: {
    paddingVertical: 4,
  },
  dropdownPickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  dropdownPickerItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownPickerEmpty: {
    padding: 12,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  streetInputWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  streetSearchLoader: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  streetSuggestionsList: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  streetSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  streetSuggestionText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  orderDetailsSaveBtn: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  orderDetailsSaveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Tables Modal (Image 2 & 4)
  tablesModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tablesModalSheet: {
    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 14,
  },
  tablesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  tablesModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222',
  },
  tablesHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tablesRefreshBtn: {
    padding: 4,
  },
  tablesCloseBtn: {
    padding: 4,
  },
  tablesLoaderWrap: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablesScroll: {
    flex: 1,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
    gap: 12,
  },
  tablesEmptyWrap: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
  },
  tablesEmptyText: {
    color: '#888',
    fontSize: 15,
  },

  // Table Card (Matches foodola.foodola.shop/pos)
  tableCard: {
    width: '48%',
    minHeight: 185,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
    padding: 10,
    position: 'relative',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableCardSelected: {
    backgroundColor: '#fff8f6',
    borderColor: '#e53935',
  },
  tableCardOccupiedBorder: {
    borderColor: '#f44336',
  },
  tableCardAvailableBorder: {
    borderColor: '#4caf50',
  },
  tableReservationBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 8,
    zIndex: 6,
  },
  tableReservationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  tableCardBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#e53935',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    zIndex: 5,
  },
  tableCardBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  tableImageContainer: {
    width: '100%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  tableImage: {
    width: '90%',
    height: 68,
  },
  tableImageFallback: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tableNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  tableNameTextSelected: {
    color: '#e53935',
  },
  tableSeatsText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  tableSeatsTextSelected: {
    color: '#e53935',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusPillOccupied: {
    backgroundColor: '#f44336',
  },
  statusPillAvailable: {
    backgroundColor: '#4caf50',
  },
  statusPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
  occupiedTimePill: {
    flexDirection: 'row',
    backgroundColor: '#e53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupiedTimePillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  availableSpacer: {
    height: 12,
  },

  // Deal Modal Addons & Free items (Matches foodola-pos)
  dealAddonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  freeItemsBadge: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  freeItemsBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  dealAddonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  dealAddonLabelWrap: {
    flex: 1,
    paddingRight: 10,
  },
  addonStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  stepperQty: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
});
