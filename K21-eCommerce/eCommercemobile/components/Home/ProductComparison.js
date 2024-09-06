import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View, useWindowDimensions } from "react-native";
import APIs, { endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles";
import { Card } from "react-native-paper";
import RenderHTML from "react-native-render-html";

const ProductComparison = ({ route }) => {
    const { currentProductId, selectedProductId } = route.params;
    const [currentProduct, setCurrentProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { width } = useWindowDimensions();

    useEffect(() => {
        const loadProductDetails = async () => {
            try {
                let resCurrent = await APIs.get(endpoints["product-details"](currentProductId));
                setCurrentProduct(resCurrent.data);

                let resSelected = await APIs.get(endpoints["product-details"](selectedProductId));
                setSelectedProduct(resSelected.data);
            } catch (ex) {
                console.error("Error fetching product details:", ex);
            }
        };

        loadProductDetails();
    }, [currentProductId, selectedProductId]);

    if (!currentProduct || !selectedProduct) {
        return <ActivityIndicator />;
    }

    return (
        <View style={MyStyles.container}>
            <ScrollView style={[MyStyles.containerproduct, { padding: 16 }]}>
                <Text style={MyStyles.titleproduct}>Product Comparison</Text>
                <View style={MyStyles.comparisonContainer}>
                    <Card style={[MyStyles.productContainer, { left: 0 }]}>
                        <Card.Cover source={{ uri: currentProduct.image }} style={MyStyles.productImage} />
                        <Card.Title style={MyStyles.productName} title={currentProduct.name} />
                        <Card.Title style={MyStyles.productPrice} title={currentProduct.price} />
                        <Card.Title style={MyStyles.productPrice} title={currentProduct.store.name} />
                        <Card.Title style={MyStyles.productPrice} title={currentProduct.inventory_quantity} />
                        <Card.Content>
                            <RenderHTML contentWidth={width} source={{ html: currentProduct.description }} />
                        </Card.Content>
                    </Card>
                    <View style={MyStyles.centerContainer}>
                        <Text style={MyStyles.centerText}>Name</Text>
                        <Text style={[MyStyles.centerText, { marginTop: 11 }]}>Price</Text>
                        <Text style={[MyStyles.centerText, { marginTop: 14 }]}>Store</Text>
                        <Text style={[MyStyles.centerText, { marginTop: 5 }]}>Inventory{"\n"}quantity</Text>
                        <Text style={[MyStyles.centerText, { marginTop: 50 }]}>Description</Text>

                    </View>
                    <Card style={[MyStyles.productContainer, { right: 0 }]}>
                        <Card.Cover source={{ uri: selectedProduct.image }} style={MyStyles.productImage} />
                        <Card.Title style={MyStyles.productName} title={selectedProduct.name} />
                        <Card.Title style={MyStyles.productPrice} title={selectedProduct.price} />
                        <Card.Title style={MyStyles.productPrice} title={currentProduct.store.name} />
                        <Card.Title style={[MyStyles.productPrice, { right: 0 }]} title={currentProduct.inventory_quantity} />
                        <Card.Content>
                            <RenderHTML contentWidth={width} source={{ html: selectedProduct.description }} />
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

export default ProductComparison;

{/* <View style={MyStyles.productContainer}>
                        <Image source={{ uri: currentProduct.image }} style={MyStyles.productImage} />
                        <Text style={MyStyles.productName}>{currentProduct.name}</Text>
                        <Text style={MyStyles.productPrice}>{currentProduct.price}</Text>
                        <Text style={MyStyles.productDescription}>{currentProduct.description}</Text>
                    </View>
                    <View style={MyStyles.productContainer}>
                        <Image source={{ uri: selectedProduct.image }} style={MyStyles.productImage} />
                        <Text style={MyStyles.productName}>{selectedProduct.name}</Text>
                        <Text style={MyStyles.productPrice}>{selectedProduct.price}</Text>
                        <Text style={MyStyles.productDescription}>{selectedProduct.description}</Text>
                    </View> */}