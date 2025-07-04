import React from 'react';
import { TouchableOpacity } from 'react-native';
// import SkeletonPlaceholder from 'react-native-skeleton-placeholder';


const RowSkeleton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* <SkeletonPlaceholder
        speed={1350}
        borderRadius={12}
        highlightColor={"#DFC700"}
        backgroundColor={"#DCD495"}>
        <SkeletonPlaceholder.Item marginTop={15} flexDirection="row" alignItems="center">
          <SkeletonPlaceholder.Item
            width={'92%'}
            height={50}
            marginLeft='4%'
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder> */}
    </TouchableOpacity>
  );
};

export default RowSkeleton;