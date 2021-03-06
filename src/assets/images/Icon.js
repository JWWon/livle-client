import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { styles } from '../stylesheets/global/Style';
import {
  width_height_ratio,
  height_width_ratio,
} from '../stylesheets/global/Scale';

export const NAV_ICONS = [
  {
    // NAV_GO_ICON
    ON: require('./nav_go_on.png'),
    OFF: require('./nav_go_off.png'),
  },
  {
    // NAV_HOME_ICON
    ON: require('./nav_home_on.png'),
    OFF: require('./nav_home_off.png'),
  },
  {
    // NAV_SETTING_ICON
    ON: require('./nav_setting_on.png'),
    OFF: require('./nav_setting_off.png'),
  },
];

const icon_info = {
  ic_back: {
    source: require('./ic_back.png'),
    originWidth: 38,
    originHeight: 64,
  },
  ic_check_white: {
    source: require('./ic_check_white.png'),
    originWidth: 19,
    originHeight: 16,
  },
  ic_check: {
    source: require('./ic_check.png'),
    originWidth: 128,
    originHeight: 90,
  },
  ic_close: {
    source: require('./ic_close.png'),
    originWidth: 66,
    originHeight: 66,
  },
  ic_go_off: {
    source: require('./ic_go_off.png'),
    originWidth: 272,
    originHeight: 272,
  },
  ic_go_on: {
    source: require('./ic_go_on.png'),
    originWidth: 272,
    originHeight: 272,
  },
  ic_more: {
    source: require('./ic_more.png'),
    originWidth: 685,
    originHeight: 374,
  },
  ic_next: {
    source: require('./ic_next.png'),
    originWidth: 681,
    originHeight: 1195,
  },
  ic_pause: {
    source: require('./ic_pause.png'),
    originWidth: 70,
    originHeight: 116,
  },
  ic_play: {
    source: require('./ic_play.png'),
    originWidth: 90,
    originHeight: 132,
  },
  ic_ticket_blink: {
    source: require('./ic_ticket_blink.png'),
    originWidth: 137,
    originHeight: 66,
  },
  ic_top: {
    source: require('./ic_top.png'),
    originWidth: 201,
    originHeight: 201,
  },
  logo_livle: {
    source: require('./logo_livle.png'),
    originWidth: 2061,
    originHeight: 418,
  },
};

const Icon = ({
  src,
  iconStyle,
  width,
  height,
  fitToIcon,
  onPress,
  ...options
}) => {
  const data = icon_info[src];
  const iconWidth =
    width || height * width_height_ratio(data.originWidth, data.originHeight);
  const iconHeight =
    height || width * height_width_ratio(data.originWidth, data.originHeight);
  const iconSize = { width: iconWidth, height: iconHeight };

  return onPress ? (
    <TouchableOpacity
      onPress={onPress}
      style={fitToIcon ? iconSize : styles.alignCenter}
      {...options}>
      <Image
        source={data.source}
        style={[iconSize, StyleSheet.flatten(iconStyle)]}
      />
    </TouchableOpacity>
  ) : (
    <Image
      source={data.source}
      style={[iconSize, StyleSheet.flatten(iconStyle)]}
    />
  );
};

Icon.propTypes = {
  src: PropTypes.string.isRequired,
  // width 또는 height 중 1개만 입력
  width: PropTypes.number,
  height: PropTypes.number,
  fitToIcon: PropTypes.bool,

  onPress: PropTypes.func,
  iconStyle: PropTypes.object,
};

export default Icon;
