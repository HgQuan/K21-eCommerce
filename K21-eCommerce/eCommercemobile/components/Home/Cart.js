import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
import { Checkbox, List } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

const Cart = () => {
    const [carts, setCarts] = useState([])

    const loadCart = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            console.log('Token', token)
            let res = await authApi(token).get(endpoints['cart']);
            console.log('Data: ', res.data.items)
            setCarts(res.data.items);
        } catch (ex) {
            console.error(ex);
        }
    }

    // useEffect(() => {
    //     loadCart();
    // }, [])

    useFocusEffect(
        useCallback(() => {
            loadCart();
        }, [])
    );

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await authApi(token).post(`https://tuankiet.pythonanywhere.com/carts/1/update_quantity/`, {
                item_id: cartItemId,
                quantity: quantity
            });
            setCarts(current => current.map(cartItem =>
                cartItem.id === cartItemId ? { ...cartItem, quantity: quantity } : cartItem
            ));
        } catch (ex) {
            console.error('Error updating cart item quantity:', ex);
        }
    };

    const deleteCartItem = async (cartItemId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await authApi(token).delete(`https://tuankiet.pythonanywhere.com/cartitems/${cartItemId}/`);
            setCarts(current => current.filter(cartItem => cartItem.id !== cartItemId));
        } catch (ex) {
            console.error('Error deleting cart item:', ex);
        }
    };

    const selectCartItem = async (cartItemId) => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await authApi(token).post(`https://tuankiet.pythonanywhere.com/carts/1/select_item/`, {
                item_id: cartItemId
            });
            setCarts(current => current.map(cartItem =>
                cartItem.id === cartItemId ? { ...cartItem, selected: !cartItem.selected } : cartItem
            ));
        } catch (ex) {
            console.error('Error selecting cart item:', ex);
        }
    };

    const checkout = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            let res = await authApi(token).post(`https://tuankiet.pythonanywhere.com/carts/1/check_out/`);
            if (res.status === 200) {
                Alert.alert("Success", "Payment successful!");
                setCarts([]);
            }
        } catch (ex) {
            // console.error('Error during checkout:', ex);
            Alert.alert("Thông báo", "Chưa có sản phẩm để thanh toán");
        }
    };

    return (
        <View style={{ margin:10}}>
            {carts && carts.length > 0 ? (
                carts.map(c => (
                    <Card style={{ backgroundColor:"white", marginBottom: 10}}>
                        <List.Item
                        key={c.id}
                        style={[MyStyles.margin, {marginBottom:10, backgroundColor:"white", padding:20, paddingVertical:10, flexDirection: 'row'}]}
                        title={c.product.name}
                        description={`Price: ${c.product.price} - Quantity: ${c.quantity}`}
                        left={() => (
                            <View style={{ flexDirection: 'row', alignItems:"center"}}><Image style={[MyStyles.image]} source={{ uri: c.product.image }} /></View>
                        )}
                    />
                        <View style={{flexDirection: 'row', justifyContent:"space-between", alignItems:"center", height:80, backgroundColor:"orange", borderBottomEndRadius:10, borderBottomLeftRadius:10, padding:10 }}>
                            <Checkbox
                                status={c.selected ? 'checked' : 'unchecked'}
                                onPress={() => selectCartItem(c.id)}
                            />
                            <TouchableOpacity onPress={() => updateCartItemQuantity(c.id, c.quantity - 1)}>
                                <Text style={{ color: 'blue', marginRight: 10, fontSize: 16 }}>-</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 16}}>{c.quantity}</Text>
                            <TouchableOpacity onPress={() => updateCartItemQuantity(c.id, c.quantity + 1)}>
                                <Text style={{ color: 'blue', marginLeft: 10, fontSize: 16 }}>+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => (
                                Alert.alert('Thông báo','Bạn có chắc chắn muốn xóa sản phẩm này', [
                                    {
                                        text: 'OK', 
                                        onPress:() => {
                                            deleteCartItem(c.id);
                                            Alert.alert('Đã xóa thành công')
                                        }
                                    },
                                    {
                                        text: 'Cancel',
                                        style: 'cancel'
                                    }
                                ])
                                
                            )} style={{ marginLeft: 10}}>
                                <Text style={{ color: 'red' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>  
                    </Card>
                    
                ))
            ) : (
                <Text style={MyStyles.margin}>No items in the cart.</Text>
            )}
            {carts && carts.length > 0 && (
                <TouchableOpacity onPress={checkout} style={MyStyles.checkoutButton}>
                    <Text style={MyStyles.checkoutButtonText}>Checkout</Text>
                </TouchableOpacity>
            )}
            
        </View>
    );
}

export default Cart;