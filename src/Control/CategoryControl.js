import React, { Fragment, useEffect, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import FormGroup from "../Content/FormGroup";
import { CategoryContext } from "../Controller/CategoryController";
import { deviceHeight, scaleSize } from "../Themes/AppsStyle";

export const CategoryControl = React.forwardRef((props, refParent) => {
    const { appcolor, kpiinfo } = useSelector(state => state.GAppState)
    const [listDivision, setDivision] = useState([])
    const [listCategory, setCategory] = useState([])
    const [listSubCate, setSubCate] = useState([])
    const [listSegment, setSegment] = useState([])
    const [listSubsegment, setSubsement] = useState([])
    const [listProduct, setProduct] = useState([])
    const [seleted, setSelected] = useState({})
    useEffect(() => {
        setSelected({})
        onLoad()
        return () => false
    }, [])
    const onLoad = async () => {
        const f1 = seleted.division !== undefined ? seleted.division.code || null : null
        const f2 = seleted.category !== undefined ? seleted.category.code || null : null
        const f3 = seleted.subcate !== undefined ? seleted.subcate.code || null : null
        const f4 = seleted.segment !== undefined ? seleted.segment.code || null : null
        const f5 = seleted.subsegment !== undefined ? seleted.subsegment.code || null : null
        props.config.forEach(async element => {
            switch (element.name) {
                case "competitor":
                    const d1 = await CategoryContext.GetDivision(f1);
                    await setDivision(d1)
                    break;
                case "category":
                    const d2 = await CategoryContext.GetCategory(f1);
                    await setCategory(d2)
                    break;
                case "subcategory":
                    const d3 = await CategoryContext.GetSubCate(f1, f2);
                    await setSubCate(d3)
                    break;
                case "segment":
                    const d4 = await CategoryContext.GetSegment(f1, f2, f3);
                    await setSegment(d4)
                    break;
                case "subsegment":
                    const d5 = await CategoryContext.GetSubSegment(f1, f2, f3, f4);
                    await setSubsement(d5)
                    break;
                default:
                    break;
            }
        });
        const d6 = await CategoryContext.GetProduct(f1, f2, f3, f4, f5);
        await setProduct(d6)
    }
    const fillter = async (tagFilter, nextKey) => {
        const f1 = tagFilter.division !== undefined ? tagFilter.division.code || null : null
        const f2 = tagFilter.category !== undefined ? tagFilter.category.code || null : null
        const f3 = tagFilter.subcate !== undefined ? tagFilter.subcate.code || null : null
        const f4 = tagFilter.segment !== undefined ? tagFilter.segment.code || null : null
        const f5 = tagFilter.subsegment !== undefined ? tagFilter.subsegment.code || null : null
        // console.log(nextKey)
        switch (nextKey) {
            case 'division':
                const d2 = await CategoryContext.GetCategory(f1);
                await setCategory(d2)
                break;
            case 'category':
                const d3 = await CategoryContext.GetSubCate(f1, f2);
                await setSubCate(d3)
                break;
            case 'subcate':
                const d4 = await CategoryContext.GetSegment(f1, f2, f3);
                await setSegment(d4)
                break;
            case 'segment':
                const d5 = await CategoryContext.GetSubSegment(f1, f2, f3, f4);
                await setSubsement(d5)
                break;
            case 'subsegment':
                const d6 = await CategoryContext.GetProduct(f1, f2, f3, f4, f5);
                await setProduct(d6)
                break;
            default:
                break;
        }
        const d6 = await CategoryContext.GetProduct(f1, f2, f3, f4, f5);
        await setProduct(d6)
    }
    const onSeletedItem = (item, key) => {
        const fistStatus = item.selected
        const info = { ...seleted }
        if (key === 'category') {
            const _category = [...listCategory]
            _category.forEach(element => {
                element.selected = item.code === element.code ? !item.selected : false
            });
            setCategory(_category)
        }
        if (key === 'subcate') {
            const _t2 = [...listSubCate]
            _t2.forEach(element => {
                element.selected = item.code === element.code ? !item.selected : false
            });
            setSubCate(_t2)
        }
        if (key === 'segment') {
            const _t3 = [...listSegment]
            _t3.forEach(element => {
                element.selected = item.code === element.code ? !item.selected : false
            });
            setSegment(_t3)
        }
        info[key] = fistStatus === true ? undefined : item
        setSelected(info)
        fillter(info, key);
    }
    return (

        <View style={{height:deviceHeight*0.6}}>
            <View style={{ display: listDivision.length > 0 ? 'flex' : 'none', width: '100%', borderRadius: 12, backgroundColor: appcolor.light, paddingLeft: 7, paddingEnd: 7, paddingTop: 7, }}>
                <Text style={{ fontWeight: '900', marginBottom: 7, fontSize: scaleSize(16), color: appcolor.dark }}>Hãng</Text>
                <FlatList
                    data={listDivision} horizontal={true}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity onPress={() => onSeletedItem(item, "division")} key={'D1' + index} style={{ padding: 3, marginBottom: 7 }}>
                                <View style={{
                                    backgroundColor: appcolor.light, borderWidth: appcolor.surface,
                                    flexDirection: 'row', borderRadius: 40, borderWidth: 1, padding: 7
                                }}>
                                    <Text style={{ color: appcolor.dark, }}> {item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>
            <View style={{ display: listCategory.length > 0 ? 'flex' : 'none', width: '100%', paddingLeft: 7, paddingEnd: 7, paddingTop: 7, backgroundColor: appcolor.light }}>
                <Text style={{ fontWeight: '900', marginBottom: 7, fontSize: scaleSize(16), color: appcolor.dark }}>Ngành hàng</Text>
                <FlatList horizontal={true}
                    data={listCategory}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity onPress={() => onSeletedItem(item, "category")} key={'D2' + index} style={{ padding: 3, marginBottom: 7 }}>
                                <View style={{
                                    backgroundColor: item.selected === true ? appcolor.primary : appcolor.light, borderWidth: appcolor.surface,
                                    flexDirection: 'row', borderRadius: 40, borderWidth: 1, padding: 7
                                }}>
                                    <Text style={{ color: appcolor.dark, }}> {item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }
                    }
                />
            </View>
            <View style={{ display: listSubCate.length > 0 ? 'flex' : 'none', width: '100%', paddingLeft: 7, paddingEnd: 7, paddingTop: 7, backgroundColor: appcolor.light }}>
                <Text style={{ fontWeight: '900', marginBottom: 7, fontSize: scaleSize(16), color: appcolor.dark }}> Nhóm ngành hàng</Text>
                <FlatList
                    data={listSubCate} horizontal
                    renderItem={({ item, index }) =>
                        <TouchableOpacity onPress={() => onSeletedItem(item, "subcate")} key={'D3' + index} style={{ padding: 3, marginBottom: 7 }}>
                            <View style={{
                                backgroundColor: item.selected === true ? appcolor.primary : appcolor.light, borderWidth: appcolor.surface,
                                flexDirection: 'row', borderRadius: 40, borderWidth: 1, padding: 7
                            }}>
                                <Text style={{ color: appcolor.dark, }}> {item.name}</Text>
                            </View>
                        </TouchableOpacity>

                    }
                />
            </View>
            <View style={{ display: listSegment.length > 0 ? 'flex' : 'none', width: '100%', paddingLeft: 7, paddingEnd: 7, paddingTop: 7, backgroundColor: appcolor.light }}>
                <Text style={{ fontWeight: '900', marginBottom: 7, fontSize: scaleSize(16), color: appcolor.dark }}> Nhóm sản phẩm</Text>
                <FlatList
                    data={listSegment} horizontal
                    renderItem={({ item, index }) =>
                        <TouchableOpacity onPress={() => onSeletedItem(item, "segment")} key={'D4' + index} style={{ padding: 3, marginBottom: 7 }}>
                            <View style={{
                                backgroundColor: item.selected === true ? appcolor.primary : appcolor.light, borderWidth: appcolor.surface,
                                flexDirection: 'row', borderRadius: 40, borderWidth: 1, padding: 7
                            }}>
                                <Text style={{ color: appcolor.dark, }}> {item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                />
            </View>
            <View style={{ display: listSubsegment.length > 0 ? 'flex' : 'none', width: '100%', paddingLeft: 7, paddingEnd: 7, paddingTop: 7, backgroundColor: appcolor.light }}>
                <Text style={{ fontWeight: '900', marginBottom: 7, fontSize: scaleSize(16), color: appcolor.dark }}> Loại</Text>
                <FlatList
                    data={listSubsegment} horizontal
                    renderItem={({ item, index }) =>
                        <TouchableOpacity onPress={() => onSeletedItem(item, "subsegment")}
                            key={'D5' + index} style={{ padding: 3, marginBottom: 7 }}>
                            <View style={{
                                backgroundColor: item.selected === true ? appcolor.primary : appcolor.light, borderWidth: appcolor.surface,
                                flexDirection: 'row', borderRadius: 40, borderWidth: 1, padding: 7
                            }}>
                                <Text style={{ color: appcolor.dark, }}> {item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                />
            </View>
            <View style={{ width: '100%', paddingLeft: 7, paddingEnd: 7, paddingTop: 7, backgroundColor: appcolor.surface, marginBottom: 50 }}>
                <FormGroup editable title={"Tổng số sản phẩm " + listProduct.length || 0}
                    placeholder={'Nhập sản phẩm cần tìm... '} />
                <FlatList
                    data={listProduct}
                    renderItem={({ item, index }) =>
                        <TouchableOpacity onPress={() => onSeletedItem(item, "product")}
                            style={{ borderRadius: 12, marginBottom: 7, flexGrow: 1, backgroundColor: appcolor.light }} key={'D6' + index} >
                            <View style={{ padding: 12, }}>
                                <Text style={{ fontSize: scaleSize(12), color: appcolor.dark, }}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                />
            </View>
        </View>
    )
})