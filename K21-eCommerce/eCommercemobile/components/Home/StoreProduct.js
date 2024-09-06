import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { List, Card } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";


const StoreProduct = ({ route, navigation }) => {
    const store_id = route.params?.store_id;
    const [productsStore, setProductsStore] = useState([]);
    const [nextPage, setNextPage] = useState(`https://tuankiet.pythonanywhere.com/stores/${store_id}/products/?page=1`);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);


    const loadMoreProducts = async () => {
        if (loading || !hasNextPage) return;

        setLoading(true);
        try {
            let res = await APIs.get(nextPage);
            //console.log('DATA: ', res.data)
            setProductsStore(current => current.concat(res.data.results));
            setNextPage(res.data.next);
            setHasNextPage(!!res.data.next);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMoreProducts();
    }, []);

    const handleScroll = async (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isCloseToBottom && hasNextPage && !loading) {
            await loadMoreProducts();
        }
    };

    const deleteProductItem = async (productItemId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await authApi(token).delete(`https://tuankiet.pythonanywhere.com/products/${productItemId}/`);
            setProductsStore(current => current.filter(product => product.id !== productItemId));
        } catch (ex) {
            console.error('Error deleting product item:', ex);
        }
    };

    const handleProductPress = (productId) => {
        navigation.navigate('EditProduct', { productId });
    };


    return (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
            {productsStore && productsStore.length > 0 ? (
                productsStore.map(c => (
                    <Card style={{ margin:5, backgroundColor:"white"}}>
                        <List.Item
                        key={c.id}
                        style={MyStyles.margin}
                        title={c.name}
                        description={`Price: ${c.price}`}
                        onPress={() => handleProductPress(c.id)}
                        left={() => <Image style={MyStyles.image} source={{ uri: c.image }} />}
                        right={() => (
                            <TouchableOpacity onPress={() => (
                                Alert.alert('Thông báo','Bạn có chắc chắn muốn xóa sản phẩm này', [
                                    {
                                        text: 'OK', 
                                        onPress:() => {
                                            deleteProductItem(c.id);
                                            Alert.alert('Đã xóa thành công')
                                        }
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    }
                                ]))}>
                                <Text style={{ color: 'red' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                    />
                    </Card>                 
                ))
            ) : (
                <Text style={MyStyles.margin}>No items in the store.</Text>
            )}
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </ScrollView>
    );
}

export default StoreProduct;