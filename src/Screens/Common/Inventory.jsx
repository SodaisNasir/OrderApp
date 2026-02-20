import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Alert,
    Modal,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { Colors } from '../../../important/Colors';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://foodola.foodola.shop/Laravel/api/';

const InventoryScanner = () => {
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [scannedProducts, setScannedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [cameraPermission, setCameraPermission] = useState(null);
    const [loading, setLoading] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const device = useCameraDevice('back');
    const scanTimeout = useRef(null);
    const lastScannedCode = useRef(null);
    const scanCount = useRef(0);

    // Camera Permission
    useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        const permission = await Camera.requestCameraPermission();
        setCameraPermission(permission === 'granted');
    };

    // Show Toast Message
    const showToast = (type, text1, text2) => {
        Toast.show({
            type: type,
            text1: text1,
            text2: text2,
            position: 'top',
            visibilityTime: 2000,
        });
    };

    // Safe JSON Parser
    const safeJsonParse = async (response) => {
        const text = await response.text();
        try {
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                console.error('Received HTML instead of JSON:', text.substring(0, 200));
                return {
                    error: true,
                    message: 'Server error - received HTML instead of JSON',
                    status: response.status
                };
            }
            return JSON.parse(text);
        } catch (error) {
            console.error('JSON Parse Error:', error);
            return {
                error: true,
                message: 'Invalid JSON response from server',
            };
        }
    };

    // Extract SKU from QR URL
    const extractSkuFromUrl = (url) => {
        try {
            console.log('Original QR URL:', url);

            // Case 1: Direct SKU like "04"
            if (/^\d+$/.test(url)) {
                console.log('Direct SKU number:', url);
                return url;
            }

            // Case 2: URL with SVG extension
            if (url.includes('.svg')) {
                const matches = url.match(/\/(\d+)\.svg$/);
                if (matches && matches[1]) {
                    console.log('Extracted SKU from SVG:', matches[1]);
                    return matches[1];
                }
            }

            // Case 3: Foodola URL format
            if (url.includes('foodola.foodola.shop')) {
                const matches = url.match(/\/(\d+)\./);
                if (matches && matches[1]) {
                    console.log('Extracted SKU from Foodola URL:', matches[1]);
                    return matches[1];
                }
            }

            // Case 4: Any URL - try to extract last part
            const parts = url.split('/');
            const lastPart = parts[parts.length - 1];

            if (lastPart) {
                const possibleSku = lastPart.split('.')[0];
                if (/^\d+$/.test(possibleSku)) {
                    console.log('Extracted numeric SKU:', possibleSku);
                    return possibleSku;
                }
            }

            console.log('Could not extract valid SKU');
            return null;
        } catch (error) {
            console.log('Error extracting SKU:', error);
            return null;
        }
    };

    // Fetch Raw Product API
    const fetchRawProduct = async (sku) => {
        try {
            setApiLoading(true);
            console.log('Fetching product for SKU:', sku);

            const formData = new FormData();
            formData.append('sku', sku);

            const response = await fetch(`${BASE_URL}inventory/raw_product`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Raw Product API Status:', response.status);

            const data = await safeJsonParse(response);

            if (data.error) {
                console.error('Raw Product API Error:', data);
                return {
                    success: false,
                    error: `Server error`
                };
            }

            console.log('Raw Product API Data:', data);

            // Check if data has success property with nested data
            if (data.success && data.success.data && data.success.data.id) {
                const productData = data.success.data;
                return {
                    success: true,
                    product: {
                        id: productData.id,
                        name: productData.name || 'Product Name',
                        sku: productData.sku || sku,
                        price: productData.price || 0,
                        unit_id: productData.unit_id || 1,
                        unit_name: productData.unit_id === 2 ? 'Piece' : 'Unit',
                        current_stock: productData.current_stock || 0,
                    }
                };
            }

            return {
                success: false,
                error: 'Product not found in system'
            };

        } catch (error) {
            console.error('Fetch error:', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        } finally {
            setApiLoading(false);
        }
    };

    // Submit Bulk Products API
    const submitBulkProducts = async (products) => {
        try {
            setLoading(true);
            console.log('Submitting products:', products);

            const response = await fetch(`${BASE_URL}inventory/scan-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    products: JSON.stringify(products)
                }),
            });

            console.log('Submit API Status:', response.status);

            const data = await safeJsonParse(response);

            if (data.error) {
                console.error('Submit API Error:', data);
                return {
                    success: false,
                    message: `Server error`
                };
            }

            console.log('Submit API Response:', data);

            return {
                success: true,
                data: data,
                message: data.message || 'Products submitted successfully'
            };

        } catch (error) {
            console.error('Submit error:', error);
            return {
                success: false,
                message: 'Network error occurred. Please try again.'
            };
        } finally {
            setLoading(false);
        }
    };

    // Handle Product Scan
    const handleProductScan = async (scannedData) => {
        console.log('Processing scan for:', scannedData);
        setIsScannerActive(false);
        try {
            // Extract SKU
            const sku = extractSkuFromUrl(scannedData);
            console.log('Extracted SKU:', sku);

            if (!sku) {
                showToast('error', 'Invalid QR', 'Could not extract SKU from QR code');
                return;
            }

            // Check if already in list
            const existingProduct = scannedProducts.find(item => item.sku === sku);

            if (existingProduct) {
                showToast(
                    'error',
                    'Duplicate Product',
                    `${existingProduct.name} is already in your list. Please update quantity manually.`
                );

                lastScannedCode.current = null;
                setIsScannerActive(false); // ✅ important
                return;
            }

            // Call API for new product
            const result = await fetchRawProduct(sku);

            if (result.success && result.product) {
                setScannedProducts(prev => [...prev, result.product]);
                setQuantities(prev => ({
                    ...prev,
                    [result.product.id]: 1,
                }));

                showToast('success', 'Success', `${result.product.name} added successfully`);
                setIsScannerActive(false);
                lastScannedCode.current = null;
            } else {
                showToast('error', 'Not Found', result.error || 'Product not found in system');
                setIsScannerActive(false);
                lastScannedCode.current = null;
            }
        } catch (error) {
            console.error('Scan handling error:', error);
            showToast('error', 'Error', 'Failed to process scan');
            // Scanner remains open for next scan
        }
    };

    // Update Quantity
    const updateQuantity = (productId, value) => {
        const numValue = parseInt(value) || 0;
        if (numValue >= 1) {
            setQuantities((prev) => ({
                ...prev,
                [productId]: numValue,
            }));
        }
    };

    // Remove Product from List
    const removeProduct = (productId) => {
        Alert.alert(
            'Remove Product',
            'Are you sure you want to remove this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setScannedProducts((prev) =>
                            prev.filter((item) => item.id !== productId)
                        );
                        const newQuantities = { ...quantities };
                        delete newQuantities[productId];
                        setQuantities(newQuantities);

                        showToast('info', 'Removed', 'Product removed from list');
                    }
                }
            ]
        );
    };

    // Submit All Products
    const handleSubmit = async () => {
        if (scannedProducts.length === 0) {
            showToast('error', 'Error', 'No products to submit');
            return;
        }

        try {
            const productsData = scannedProducts.map((product) => ({
                product_id: product.id,
                quantity: quantities[product.id] || 1,
            }));

            console.log('Submitting products:', productsData);

            const response = await submitBulkProducts(productsData);

            if (response.success) {
                showToast('success', 'Success', response.message || 'Products submitted successfully');
                setScannedProducts([]);
                setQuantities({});
            } else {
                showToast('error', 'Error', response.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showToast('error', 'Error', 'Failed to submit products. Please try again.');
        }
    };

    // Code Scanner Setup
    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
        onCodeScanned: (codes) => {
            if (codes.length > 0 && isScannerActive && !apiLoading) {
                const scannedValue = codes[0].value;
                const currentTime = Date.now();

                console.log('QR Code detected:', scannedValue);

                // Prevent duplicate scans within 1 second
                if (lastScannedCode.current === scannedValue &&
                    (currentTime - scanCount.current) < 1000) {
                    console.log('Duplicate scan ignored');
                    return;
                }

                // Update last scanned code and time
                lastScannedCode.current = scannedValue;
                scanCount.current = currentTime;

                // Clear any existing timeout
                if (scanTimeout.current) {
                    clearTimeout(scanTimeout.current);
                }

                // Process the scan
                scanTimeout.current = setTimeout(() => {
                    handleProductScan(scannedValue);
                }, 100);
            }
        },
    });

    // Render Product Item
    const renderProductItem = ({ item, index }) => (
        <View style={styles.productCard}>
            <View style={styles.productHeader}>
                <View style={styles.productIndex}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.productIconContainer}>
                    <Icon name="inventory" size={32} color={Colors.primary} />
                </View>
                <View style={styles.productMainInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <View style={styles.skuContainer}>
                        <Icon name="qr-code" size={14} color="#666" />
                        <Text style={styles.productSku}>SKU: {item.sku}</Text>
                    </View>
                </View>
            </View>

            {/* Product Details Section */}
            <View style={styles.productDetails}>
                <View style={styles.detailRow}>
                    <Icon name="straighten" size={18} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Unit:</Text>
                    <Text style={styles.detailValue}>{item.unit_id || 'Piece'}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="inventory" size={18} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Current Stock:</Text>
                    <Text style={styles.detailValue}>{item.current_stock || 0}</Text>
                </View>

                {item.price > 0 && (
                    <View style={styles.detailRow}>
                        <Icon name="currency-rupee" size={18} color={Colors.primary} />
                        <Text style={styles.detailLabel}>Price:</Text>
                        <Text style={styles.detailValue}>{item.price}</Text>
                    </View>
                )}
            </View>

            <View style={styles.productFooter}>
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Quantity:</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => {
                                const newQty = (quantities[item.id] || 1) - 1;
                                if (newQty >= 1) {
                                    updateQuantity(item.id, newQty);
                                }
                            }}
                        >
                            <Icon name="remove" size={18} color="#FFF" />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.quantityInput}
                            value={String(quantities[item.id] || 1)}
                            onChangeText={(text) => {
                                const val = parseInt(text) || 1;
                                updateQuantity(item.id, val);
                            }}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                        <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => {
                                const newQty = (quantities[item.id] || 1) + 1;
                                updateQuantity(item.id, newQty);
                            }}
                        >
                            <Icon name="add" size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={() => removeProduct(item.id)} style={styles.removeBtn}>
                    <Icon name="delete" size={22} color="#FF5252" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!device) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="camera-alt" size={80} color="#999" />
                <Text style={styles.errorText}>Camera device not found</Text>
            </View>
        );
    }

    return (
        <>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Inventory Scanner</Text>
                        <Text style={styles.headerCount}>
                            {scannedProducts.length} product{scannedProducts.length !== 1 ? 's' : ''} scanned
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.scanButton, (loading || apiLoading) && styles.disabledButton]}
                        onPress={() => {
                            lastScannedCode.current = null;   // ✅ reset
                            scanCount.current = 0;            // ✅ reset
                            setIsScannerActive(true);
                        }}
                        disabled={loading || apiLoading}
                    >
                        <Icon name="qr-code-scanner" size={24} color="#FFF" />
                        <Text style={styles.scanButtonText}>Scan</Text>
                    </TouchableOpacity>
                </View>

                {/* Scanner Modal - Will stay open until manually closed */}
                <Modal
                    visible={isScannerActive}
                    animationType="slide"
                    onRequestClose={() => {
                        setIsScannerActive(false);
                        lastScannedCode.current = null;
                        scanCount.current = 0;
                    }}
                >
                    <View style={styles.scannerContainer}>
                        <Camera
                            style={StyleSheet.absoluteFill}
                            device={device}
                            isActive={isScannerActive}
                            codeScanner={codeScanner}
                        />

                        {/* Scanner Overlay */}
                        <View style={styles.scannerOverlay}>
                            <View style={styles.scannerFrame}>
                                <View style={styles.cornerTL} />
                                <View style={styles.cornerTR} />
                                <View style={styles.cornerBL} />
                                <View style={styles.cornerBR} />
                            </View>
                            <Text style={styles.scannerHint}>
                                Place QR code inside the frame
                            </Text>

                            {/* Show scanned count */}
                            <View style={styles.scannedCountContainer}>
                                <Icon name="check-circle" size={20} color="#4CAF50" />
                                <Text style={styles.scannedCountText}>
                                    {scannedProducts.length} products scanned
                                </Text>
                            </View>
                        </View>

                        {/* Close Button - Manually close scanner when done */}
                        <TouchableOpacity
                            style={styles.closeScannerButton}
                            onPress={() => {
                                setIsScannerActive(false);
                                lastScannedCode.current = null;
                            }}
                        >
                            <Icon name="close" size={30} color="#FFF" />
                        </TouchableOpacity>

                        {/* Processing Indicator */}
                        {apiLoading && (
                            <View style={styles.processingOverlay}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text style={styles.processingText}>Fetching product...</Text>
                            </View>
                        )}
                    </View>
                </Modal>

                {/* Products List */}
                {scannedProducts.length > 0 ? (
                    <FlatList
                        data={scannedProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <Icon name="check-circle" size={24} color="#FFF" />
                                <Text style={styles.submitButtonText}>
                                    {loading ? 'Submitting...' : `Submit (${scannedProducts.length})`}
                                </Text>
                            </TouchableOpacity>
                        }
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="inbox" size={120} color="#E0E0E0" />
                        <Text style={styles.emptyText}>No products scanned yet</Text>
                        <Text style={styles.emptySubText}>
                            Tap the Scan button to start scanning QR codes
                        </Text>
                    </View>
                )}
            </View>
            <Toast />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F6',
        elevation: 3,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A1F36',
    },
    headerCount: {
        fontSize: 14,
        color: '#6B7A8F',
        marginTop: 4,
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        elevation: 3,
    },
    scanButtonText: {
        color: '#FFF',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    scannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scannerFrame: {
        width: width * 0.7,
        height: width * 0.7,
        position: 'relative',
    },
    cornerTL: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 50,
        height: 50,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: Colors.primary,
    },
    cornerTR: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 50,
        height: 50,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: Colors.primary,
    },
    cornerBL: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 50,
        height: 50,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: Colors.primary,
    },
    cornerBR: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 50,
        height: 50,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: Colors.primary,
    },
    scannerHint: {
        color: '#FFF',
        marginTop: 40,
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        fontWeight: '500',
    },
    scannedCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 20,
    },
    scannedCountText: {
        color: '#FFF',
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    closeScannerButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 30,
    },
    processingOverlay: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    processingText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    listContainer: {
        padding: 16,
        paddingBottom: 20,
    },
    productCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productIndex: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    indexText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    productIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F1F8E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productMainInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1F36',
        marginBottom: 4,
    },
    skuContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productSku: {
        fontSize: 13,
        color: '#6B7A8F',
        marginLeft: 4,
    },
    productDetails: {
        backgroundColor: '#F8FAFD',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    detailLabel: {
        fontSize: 14,
        color: '#2C3E50',
        marginLeft: 8,
        fontWeight: '500',
        width: 100,
    },
    detailValue: {
        fontSize: 14,
        color: '#1A1F36',
        fontWeight: '600',
        flex: 1,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityContainer: {
        flex: 1,
        marginRight: 12,
    },
    quantityLabel: {
        fontSize: 13,
        color: '#6B7A8F',
        marginBottom: 6,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: 60,
        textAlign: 'center',
        marginHorizontal: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1F36',
        backgroundColor: '#FFF',
    },
    removeBtn: {
        width: 46,
        height: 46,
        marginTop: 15,
        borderRadius: 23,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        marginTop: 16,
        padding: 18,
        borderRadius: 30,
        elevation: 6,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1A1F36',
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 15,
        color: '#8A9CB0',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 16,
        color: '#D32F2F',
        marginTop: 12,
    },
});

export default InventoryScanner;