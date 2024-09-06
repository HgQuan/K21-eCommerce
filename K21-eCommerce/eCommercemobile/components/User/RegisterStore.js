import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity } from "react-native";
import MyStyles from "../../styles/MyStyles";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import mime from "mime"

const RegisterStore = ({ route, navigation }) => {
    const userId = route.params?.userId;
    const [store, setStore] = useState({
        "name": "",
        "email": "",
        "address": "",
        "phone_number": "",
        "owner": userId,
        "image": null,
    });
    const [loading, setLoading] = useState(false);


    const registerStore = async () => {
        setLoading(true);

        const form = new FormData();
        for (let key in store) {
            if (key === 'image' && store[key]) {
                form.append(key, {
                    uri: store[key].uri,
                    name: store[key].fileName || store[key].uri.split('/').pop(),
                    type: mime.getType(store[key].uri)
                })
            }
            else {
                form.append(key, store[key]);

            }
        }
        try {
            const token = await AsyncStorage.getItem('access-token');
            let res = await APIs.post(endpoints['stores'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.info(res.data);

            const store_id = res.data.id;
            const store_owner = res.data.owner;
            alert("Đã đăng ký thành công! Vui lòng chờ admin phê duyệt")
            navigation.navigate("Profile");
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
                change("image", res.assets[0])//sửa lại avatar thành image
            }
        }
    }

    const change = (field, value) => {
        setStore(current => {
            return { ...current, [field]: value }
        })
    }

    return (
        <ScrollView style={[MyStyles.container, MyStyles.margin, { marginHorizontal:20 }]}>
            <Text style={[MyStyles.subject, { textAlign: "center", marginTop: 100, marginBottom:10  }]}>ĐĂNG KÝ CỬA HÀNG</Text>
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="store" />} value={store.name} onChangeText={t => change("name", t)} style={MyStyles.inputLog} label="Tên cửa hàng..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="email" />} value={store.email} onChangeText={t => change("email", t)} style={MyStyles.inputLog} label="Email..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="map-marker" />} value={store.address} onChangeText={t => change("address", t)} style={MyStyles.inputLog} label="Địa chỉ..." />
            <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="phone" />} value={store.phone_number} onChangeText={t => change("phone_number", t)} style={MyStyles.inputLog} label="Số điện thoại..." keyboardType="numeric" />
            {/* <TextInput right={<TextInput.Icon style={{ paddingTop: 15 }} icon="account" />} value={store.owner}
                editable={false} style={[MyStyles.inputLog, { fontWeight: "bold" }]} /> */}
            <TouchableOpacity style={[MyStyles.input, {backgroundColor:"white", padding:10, marginBottom:10}]} onPress={picker}>
                <Text>Chọn ảnh đại diện cho cửa hàng...</Text>
            </TouchableOpacity>
            {store.image ? <Image style={{ width:"100%", height: 200, marginBottom: 10}} source={{ uri: store.image.uri }}/> : ""}

            {loading === true ? <ActivityIndicator /> : <>
                <TouchableOpacity onPress={registerStore}>
                    <Text style={MyStyles.buttonLog}>Đăng ký</Text>
                </TouchableOpacity>
            </>}
        </ScrollView>
    );
}

export default RegisterStore;