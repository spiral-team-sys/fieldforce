import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Mask, Rect, Ellipse } from 'react-native-svg';
import { deviceWidth, deviceHeight } from '../../Themes/AppsStyle';

const OVAL_RX = deviceWidth * 0.33;
const OVAL_RY = OVAL_RX * 1.28;
const OVAL_CX = deviceWidth / 2;
const OVAL_CY = deviceHeight * 0.4;

export const FACE_OVAL = {
  rx: OVAL_RX,
  ry: OVAL_RY,
  cx: OVAL_CX,
  cy: OVAL_CY,
  bottom: OVAL_CY + OVAL_RY,
};

const getBorderColor = (verifyStatus, livenessVerified, faceCount) => {
  if (faceCount === 0) return 'rgba(255,255,255,0.55)';
  if (verifyStatus === 'verified' && livenessVerified) return '#00e676';
  if (verifyStatus === 'verified') return '#29b6f6';
  if (verifyStatus === 'failed') return '#ef5350';
  if (verifyStatus === 'verifying') return '#ffca28';
  return '#ffffff';
};

const FaceScanFrame = ({
  verifyStatus = 'idle',
  livenessVerified = false,
  faceCount = 0,
}) => {
  const borderColor = useMemo(
    () => getBorderColor(verifyStatus, livenessVerified, faceCount),
    [verifyStatus, livenessVerified, faceCount],
  );

  const isDashed = verifyStatus === 'verifying' && faceCount === 1;
  const strokeWidth =
    verifyStatus === 'verified' || verifyStatus === 'failed' ? 3 : 2.5;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={deviceWidth} height={deviceHeight}>
        <Defs>
          <Mask id="faceCutout" x="0" y="0" width="100%" height="100%">
            <Rect
              x="0"
              y="0"
              width={deviceWidth}
              height={deviceHeight}
              fill="white"
            />
            <Ellipse
              cx={OVAL_CX}
              cy={OVAL_CY}
              rx={OVAL_RX}
              ry={OVAL_RY}
              fill="black"
            />
          </Mask>
        </Defs>

        {/* Dark overlay with oval cutout */}
        <Rect
          x="0"
          y="0"
          width={deviceWidth}
          height={deviceHeight}
          fill="rgba(0,0,0,0.58)"
          mask="url(#faceCutout)"
        />

        {/* Oval border — color reflects verification state */}
        <Ellipse
          cx={OVAL_CX}
          cy={OVAL_CY}
          rx={OVAL_RX}
          ry={OVAL_RY}
          fill="none"
          stroke={borderColor}
          strokeWidth={strokeWidth}
          strokeDasharray={isDashed ? '14 7' : undefined}
        />
      </Svg>
    </View>
  );
};

export default FaceScanFrame;
