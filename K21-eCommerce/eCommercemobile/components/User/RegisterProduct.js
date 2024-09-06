import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, ScrollView, View } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import APIs, { endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import mime from "mime";

const RegisterProduct = ({ route, navigation }) => {
    const store_id = route.params?.store_id;
    const user_id = route.params?.user_id;
    const [product, setProduct] = useState({
        "name": "",
        "description": "",
        "inventory_quantity": "",
        "price": "",
        "category": "",
        "image": null,
        
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);


    const loadCategories = async () => {
        try {
            let res = await APIs.get(endpoints["categories"]);
            setCategories(res.data);
        } catch (ex) {
            console.error(ex);
        }
    };

    const registerProduct = async () => {
        setLoading(true);

        const form = new FormData();
        for (let key in product)
            if (key === 'image' && product[key]) {
                form.append(key, {
                    uri: product[key].uri,
                    name: product[key].fileName || product[key].uri.split('/').pop(),
                    type: mime.getType(product[key].uri) 
                })
            }
            else if (key !== 'image') {
                form.append(key, product[key]);
            };
        try {
            const token = await AsyncStorage.getItem('access-token');
            let res = await APIs.post(endpoints['add-product'](store_id), form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.info(res.data);
            alert('Đăng ký sản phẩm thành công');
            navigation.navigate("Profile");
            // navigation.navigate("Login");
        } catch (ex) {
            if (ex.response) {
                console.error('Response data:', ex.response.data);
                console.error('Response status:', ex.response.status);
                console.error('Response headers:', ex.response.headers);
            } else if (ex.request) {
                console.error('Request data:', ex.request);
            } else {
                console.error('Error message:', ex.message);
            }
            console.error('Error config:', ex.config);

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, [])

    const categoryItems = categories.map(category => ({
        label: category.name,
        value: category.id
    }));

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permission Denied!");
        } else {
            let res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!res.canceled) {
                change("image", res.assets[0])
            }
        }
    }

    const change = (field, value) => {
        if (field === "inventory_quantity" || field === "price" ){
            const numericValue = value.replace(/[^0-9]/g, "");
            setProduct(current => {
                return { ...current, [field]: numericValue }
            }) 
        } else {
            setProduct(current => {
                return { ...current, [field]: value }
            })
        }        
        
    }

    return (
        <ScrollView style={[MyStyles.container, { marginHorizontal:20 }]}>
            {/* <Text>ĐĂNG KÝ SẢN PHẨM {store_id} {user_id}</Text> */}
            <Text style={[MyStyles.subject, { textAlign: "center", marginTop: 100, marginBottom:15 }]}>ĐĂNG KÝ SẢN PHẨM</Text>
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="store" />} value={product.name} onChangeText={t => change("name", t)} style={MyStyles.inputLog} label="Tên sản phẩm..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="pen" />} value={product.description} onChangeText={t => change("description", t)} style={MyStyles.inputLog} label="Mô tả..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="numeric" />} value={product.inventory_quantity} onChangeText={t => change("inventory_quantity", t)} style={MyStyles.inputLog} label="Số lượng..." keyboardType="numeric" />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="cash" />} value={product.price} onChangeText={t => change("price", t)} style={MyStyles.inputLog} label="Giá..." keyboardType="numeric" />
            <RNPickerSelect
                onValueChange={(value) => {
                    setSelectedCategory(value);
                    change("category", value);
                }}              
                items={categoryItems}
                placeholder={{ label: "Chọn danh mục...", value: null }}
                style={{
                    inputIOS: {
                        fontSize: 16,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        borderWidth: 1,
                        borderColor: 'gray',
                        borderRadius: 4,
                        color: 'black',
                        paddingRight: 30,
                        backgroundColor:"white",
                        marginBottom:10
                    },
                    inputAndroid: {
                        fontSize: 16,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        borderWidth: 0.5,
                        borderColor: 'lightgray',
                        borderRadius: 8,
                        color: 'gray',
                        paddingRight: 30,
                        backgroundColor:"white",
                        marginBottom:10,
                    }
                }}
            />
            <TouchableOpacity style={[MyStyles.input, {backgroundColor:"white", padding:10, marginBottom:10}]} onPress={picker}>
                <Text>Chọn ảnh cho sản phẩm...</Text>
            </TouchableOpacity>
            {product.image ? <Image style={{ width:"100%", height: 200, marginBottom: 10}} source={{ uri: product.image.uri }} /> : ""}
            {loading === true ? <ActivityIndicator /> : <>
            <TouchableOpacity onPress={registerProduct}>
                <Text style={MyStyles.buttonLog}>Đăng ký</Text>
            </TouchableOpacity>
            </>}
        </ScrollView>
    );
}

export default RegisterProduct;