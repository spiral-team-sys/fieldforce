import React, { Component } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { Card, Image } from '@rneui/themed';
import PageHeader from '../../Content/PageHeader';
import ImageView from 'react-native-image-view';
import { HeaderCustom } from '../../Content/HeaderCustom';

export default class ViewDetailPhoto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            photoList: props.route.params.dataPhoto,
            uriList: this.getSourceUri(props.route.params.dataPhoto),
            isVisible: false,
            isImageChange: false
        }
    }

    getSourceUri(lstPhotoView) {
        const sourceUri = [];
        lstPhotoView.forEach(photo => {
            let items = {
                source: {
                    uri: photo.PhotoPath
                }
            }
            sourceUri.push(items);
        })
        return sourceUri;
    }

    handlerViewImage = (photoView) => {
        const arrayChange = [];
        arrayChange.push({ source: { uri: photoView } });
        this.state.uriList.forEach(photo => {
            if (photo.source.uri !== photoView) {
                arrayChange.push(photo);
            }
        })

        this.setState({
            uriList: arrayChange,
            isVisible: true
        })
    }

    renderItem = ({ item, index }) => {
        return (
            <Card key={"29nak" + index} containerStyle={{ padding: 0 }}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={{ uri: item.PhotoPath }}
                        resizeMode='contain'
                        style={{ height: 350 }}
                        PlaceholderContent={<ActivityIndicator />}
                        //Event
                        onPress={() => this.handlerViewImage(item.PhotoPath)}
                    />
                </View>
            </Card>
        )
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <HeaderCustom leftFunc={() => this.props.navigation.goBack()} title={this.props.route.params?.shopName || 'Hình ảnh'} />
                <FlatList
                    data={this.state.photoList}
                    renderItem={this.renderItem}
                    extraData={this.state}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 24 }}
                />
                <ImageView
                    isVisible={this.state.isVisible}
                    images={this.state.uriList}
                    animationType='slide'
                    //Event   
                    onClose={() => this.setState({ isVisible: false })}
                />
            </View>
        )
    }
} 