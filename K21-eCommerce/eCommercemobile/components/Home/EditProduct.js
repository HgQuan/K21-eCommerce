import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MyStyles from "../../styles/MyStyles";
import { TextInput } from 'react-native-paper';


const EditProduct = ({ route, navigation }) => {
    //const product_id = route.params?.productId;
    const { productId } = route.params;
    const [product, setProduct] = useState({});
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [inventory_quantity, setInventoryQuantity] = useState('');

    useEffect(() => {
        // Fetch product details
        const loadProductDetails = async () => {
            try {
                let res = await axios.get(`https://tuankiet.pythonanywhere.com/products/${productId}/`);
                setProduct(res.data);
                //console.log('Data: ', res.data)
                setName(res.data.name);
                setPrice(res.data.price);
                setInventoryQuantity(res.data.inventory_quantity)
                // console.log('inventory_quantity: ', res.data.inventory_quantity)
                // console.log('inventory_quantity: ', inventory_quantity)
            } catch (ex) {
                console.error(ex);
            }
        };

        loadProductDetails();
    }, [productId]);
    // console.info(inventory_quantity)
    const updateProduct = async () => {
        try {
            let token = await AsyncStorage.getItem('access-token');
            await axios.patch(`https://tuankiet.pythonanywhere.com/products/${productId}/`, {
                name,
                price,
                inventory_quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            Alert.alert('Success', 'Product updated successfully');
            navigation.goBack();
        } catch (ex) {
            console.error('Error updating product:', ex);
            Alert.alert('Error', 'There was an error updating the product');
        }
    };


    return (

        <View style={{flex:1, margin:10, justifyContent:"center"}}>
            <TextInput
                label="Tên..."
                value={name}
                onChangeText={setName}
                style={{ backgroundColor:"white", marginVertical:5}}
            />
            <TextInput
                style={{ backgroundColor:"white", marginVertical:5}}
                label="Giá..."
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <TextInput
                style={{ backgroundColor:"white", marginVertical:5, color:"black"}}
                label="Số lượng..."
                value={inventory_quantity.toString()}
                onChangeText={setInventoryQuantity}
                keyboardType='numeric'
            />
            <Button style={MyStyles.margin} title="Update Product" onPress={updateProduct} />
        </View>
    );
}

export default EditProduct;