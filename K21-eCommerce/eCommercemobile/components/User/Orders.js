import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { Card } from "react-native-paper";
import Contexts from "../../configs/Contexts";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
//import Picker from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker";

const Orders = () => {
    const [user,] = useContext(Contexts);
    const [orders, setOrders] = useState([]);
    const [store, setStore] = useState(null);
    const [page, setPage] = useState(1);
    const [nextPage, setNextPage] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadStore = async (token, userId) => {
        try {
            let res = await authApi(token).get('/stores/');
            const store = res.data.find(store => store.owner === userId);
            if (store) {
                setStore(store);
                return store.id;
            } else {
                console.log("No store found for this user.");
                return null;
            }
        } catch (ex) {
            console.error("Error loading stores:", ex);
            return null;
        }
    };

    const loadOrders = async (page = 1) => {
        if (loading) return; // Tránh tải dữ liệu nhiều lần cùng lúc
        setLoading(true);
        try {
            let token = await AsyncStorage.getItem('access-token');
            console.log("Token:", token);

            if (token && user) {
                let res;
                if (user.role === 'SELLER') {
                    const storeId = await loadStore(token, user.id);
                    if (storeId) {
                        res = await authApi(token).get(`${endpoints['orders-store'](storeId)}?page=${page}`);
                    } else {
                        console.error("Store ID is null or undefined.");
                        setLoading(false);
                        return;
                    }
                } else {
                    res = await authApi(token).get(`${endpoints['orders-user'](user.id)}?page=${page}`);
                }

                if (res) {
                    setOrders(prevOrders => [...prevOrders, ...res.data.results]);
                    setNextPage(res.data.next);
                }
            }
        } catch (ex) {
            if (ex.response) {
                console.error("Response data:", ex.response.data);
                console.error("Response status:", ex.response.status);
                console.error("Response headers:", ex.response.headers);
            } else if (ex.request) {
                console.error("Request data:", ex.request);
            } else {
                console.error("Error message:", ex.message);
            }
            console.error("Error config:", ex.config);
        } finally {
            setLoading(false);
        }
    }

    // useEffect(() => {
    //     loadOrders();
    // }, []);

    useEffect(() => {
        if (user) {
            setOrders([]); // Reset đơn hàng khi người dùng thay đổi
            setPage(1); // Reset trang về 1
            loadOrders(1); // Tải dữ liệu trang đầu tiên
        }
    }, [user]);

    const handleLoadMore = () => {
        if (nextPage) {
            const nextPageNumber = page + 1;
            setPage(nextPageNumber);
            loadOrders(nextPageNumber);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            if (token) {
                let res = await authApi(token).patch(`https://tuankiet.pythonanywhere.com/orders/${orderId}/update_status/`, { status: newStatus });
                console.log("Status updated:", res.data);

                // Update the order status in the state
                setOrders(prevOrders => prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            }
        } catch (ex) {
            console.error("Error updating status:", ex);
            Alert.alert("Error", "Failed to update order status.");
        }
    };


    const renderOrderItem = ({ item }) => (
        <View style={MyStyles.orderItem}>
            <Text style={MyStyles.orderText}>Order ID: {item.id}</Text>
            {user.role === "SELLER" ? <Text style={MyStyles.orderText}>Buyer ID: {item.buyer}</Text> : <Text style={MyStyles.orderText}>Store ID: {item.store}</Text>}
            <Text style={MyStyles.orderText}>Total Price: {item.total_price}</Text>
            <Text style={MyStyles.orderText}>Created Date: {new Date(item.created_date).toLocaleDateString()}</Text>
            <Text style={MyStyles.orderText}>Updated Date: {new Date(item.updated_date).toLocaleDateString()}</Text>
            {user.role === "SELLER" ? (
                <Picker
                    selectedValue={item.status}
                    style={{ height: 50, width: 150 }}
                    onValueChange={(itemValue) => handleStatusChange(item.id, itemValue)}
                >
                    <Picker.Item label="Pending" value="PENDING" key="pending" />
                    <Picker.Item label="Ongoing" value="ONGOING" key="ongoing" />
                    <Picker.Item label="Success" value="SUCCESS" key="success" />
                    <Picker.Item label="On Hold" value="ONHOLD" key="onhold" />
                </Picker>
            ) : (
                <Text style={MyStyles.orderText}>Status: {item.status}</Text>
            )}
        </View>
    );

    return (
        <View style={[MyStyles.container, {margin: 15}]}>
            <Text style={MyStyles.headerText}>User Name: {user?.username}</Text>
            <Text style={MyStyles.headerText}>User Role: {user?.role}</Text>
            <Text style={MyStyles.headerText}>User ID: {user?.id}</Text>
            {store && <Text style={MyStyles.headerText}>Store ID: {store.id}</Text>}
            {/* {orders ? <Text>YES</Text> : <Text>NO</Text>} */}
            {orders && (user.role === "SELLER" || user.role === "BUYER") ? (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id.toString()}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loading && <ActivityIndicator size="large" />}
                />
            ) : (
                <Text style={MyStyles.noOrdersText}>No Orders Available</Text>
            )}
        </View>
    );
}

export default Orders;

