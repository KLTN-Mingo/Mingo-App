import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SelectCountry } from "react-native-element-dropdown";

const local_data = [
  {
    value: "1",
    lable: "Public",
    image: require("../../assets/images/public-light.png"),
  },
  {
    value: "2",
    lable: "Private",
    image: require("../../assets/images/private-light.png"),
  },
  {
    value: "3",
    lable: "Friend",
    image: require("../../assets/images/friend-light.png"),
  },
];

const MyDropDown = (_props) => {
  const [country, setCountry] = useState("1");

  return (
    <SelectCountry
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      placeholderStyle={styles.placeholderStyle}
      imageStyle={styles.imageStyle}
      iconStyle={styles.iconStyle}
      maxHeight={200}
      value={country}
      data={local_data}
      valueField="value"
      labelField="lable"
      imageField="image"
      placeholder="Select country"
      searchPlaceholder="Search..."
      onChange={(e) => {
        setCountry(e.value);
      }}
    />
  );
};

export default MyDropDown;

const styles = StyleSheet.create({
  dropdown: {
    height: 25,
    width: 120,
    backgroundColor: "#EEEEEE",
    borderRadius: 22,
    paddingHorizontal: 8,
  },
  imageStyle: {
    width: 14,
    height: 14,
    borderRadius: 12,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
  },
  iconStyle: {
    width: 10,
    height: 10,
  },
});
