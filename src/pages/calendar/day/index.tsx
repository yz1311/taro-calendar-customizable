import React, {FC, useEffect, useState} from 'react';
import {View, Text} from '@tarojs/components';
import {
  CalendarDateInfo,
  CustomStyles,
  StyleGeneratorParams
} from "../days/index";
import {CalendarTools, formatDate, LunarInfo} from "../utils";
import './index.less';

interface IProps {
  onDayLongPress?: ({value}: {value: string})=>void;
  /**
   * 是否被选中
   */
  selected: boolean;
  /** 点击事件回调 */
  onClick: (info: CalendarDateInfo) => any;
  value: CalendarDateInfo;
  /** 显示模式 普通/农历 */
  mode: 'normal' | 'lunar';
  /** 是否范围选择模式并且endDateStr不为空 **/
  isMultiSelectAndFinish: boolean;
  /**
   * 当前日期是否有mark，没有为-1
   */
  markIndex: number;
  /**
   * 当前日期是否有extraInfo，没有为-1
   */
  extraInfoIndex: number;
  /** 是否显示分割线 */
  showDivider: boolean;
  /** 最小的可选时间 */
  minDate: string;
  /** 最大的可选时间 */
  maxDate?: string | undefined;
  /** 自定义样式生成器 */
  customStyleGenerator?: (dateInfo: StyleGeneratorParams) => CustomStyles;
  /** 选定时的背景色 */
  selectedDateColor?: string;
  /**
   * mark的背景色
   */
  markColor: string|undefined;
  /**
   * mark的直径
   */
  markSize: string|undefined;
  /**
   * mark的文本,如果不为空，会导致markSize失效
   */
  markText?: string;
  /**
   * mark的fontSize
   */
  markFontSize: string|undefined;
  /**
   * extraInfo的color
   */
  extraInfoColor: string|undefined;
  /**
   * extraInfo的fontSize
   */
  extraInfoFontSize: string|undefined;
  /**
   * extraInfo的文本
   */
  extraInfoText: string|undefined;
  /**
   * 被选择（范围选择）
   */
  isInRange: boolean;
  /**
   * 范围起点
   */
  rangeStart: boolean;
  /**
   * 范围终点
   */
  rangeEnd: boolean;
  /**
   * 禁用(不在minDate和maxDate的时间范围内的日期)
   */
  disable: boolean;
}

const Day:FC<IProps> = (args)=>{
  const {selected, onDayLongPress, onClick, value, mode, markIndex,
    extraInfoIndex, customStyleGenerator, disable,
    isInRange, rangeStart, rangeEnd, isMultiSelectAndFinish,
    selectedDateColor, markColor, markSize, markText, markFontSize, extraInfoColor, extraInfoFontSize,
    extraInfoText,
    showDivider} = args;
  const [className, setClassName] = useState<Set<string>>(new Set());
  const [customStyles, setCustomStyles] = useState<CustomStyles>({});

  useEffect(()=>{
    let set = new Set<string>();
    const today = formatDate(new Date(), 'day');

    if (!value.currentMonth || disable) {
      // 非本月
      set.add('not-this-month');
    }
    if (
      selected &&
      !isMultiSelectAndFinish
    ) {
      // 选中
      // 范围选择模式显示已选范围时，不显示selected
      set.add('calendar-selected');
    }
    if (markIndex !== -1) {
      // 标记
      set.add('calendar-marked');
    }
    if (value.fullDateStr === today) {
      // 当天
      set.add('calendar-today');
    }
    if (showDivider) {
      // 分割线
      set.add('calendar-line-divider');
    }

    if(isInRange) {
      set.add('calendar-range');
    }

    if(rangeStart) {
      set.add('calendar-range-start');
    }

    if(rangeEnd) {
      set.add('calendar-range-end');
    }

    setClassName(set);
  }, [disable, extraInfoIndex, isMultiSelectAndFinish, markIndex, selected,
    showDivider, value.currentMonth, value.fullDateStr, isInRange, rangeStart, rangeEnd]);

  useEffect(()=>{
    let lunarDayInfo =
      mode === 'lunar'
        ? CalendarTools.solar2lunar(value.fullDateStr)
        : null;
    if (customStyleGenerator) {
      // 用户定制样式
      const generatorParams: StyleGeneratorParams = {
        ...value,
        lunar: lunarDayInfo,
        selected: selected,
        multiSelect: {
          multiSelected: isInRange,
          multiSelectedStar: rangeStart,
          multiSelectedEnd: rangeEnd
        },
        marked: markIndex !== -1,
        hasExtraInfo: extraInfoIndex !== -1
      };
      setCustomStyles(customStyleGenerator(generatorParams))
    }
  }, [selected, value, markIndex, extraInfoIndex, customStyleGenerator, isInRange, rangeStart, rangeEnd, mode]);


  let lunarDayInfo =
    mode === 'lunar'
      ? CalendarTools.solar2lunar(value.fullDateStr)
      : null;
  let lunarClassName = ['lunar-day'];
  let lunarDateStr = '';
  if (lunarDayInfo) {
    lunarDayInfo = lunarDayInfo as LunarInfo;
    if (lunarDayInfo.IDayCn === '初一') {
      lunarClassName.push('lunar-month');
      lunarDateStr = lunarDayInfo.IMonthCn;
    } else {
      //@ts-ignore
      lunarDateStr = lunarDayInfo.isTerm
        ? lunarDayInfo.Term
        : lunarDayInfo.IDayCn;
    }
  }

  return (
    <View
      onLongPress={
        onDayLongPress
          ? () => onDayLongPress({ value: value.fullDateStr })
          : undefined
      }
      className={Array.from(className).join(' ')}
      onClick={() => {
        if (!disable) {
          onClick(value);
        }
      }}
      style={customStyles.containerStyle}
    >
      <View
        className='calendar-date'
        style={
          customStyles.dateStyle || customStyles.dateStyle === {}
            ? customStyles.dateStyle
            : {
              backgroundColor:
                selected || isInRange
                  ? selectedDateColor
                  : ''
            }
        }
      >
        {/* 日期 */}
        <Text>{value.date}</Text>
        {mode === 'lunar' && (
          <View
            className={lunarClassName.join(' ')}
            style={customStyles.lunarStyle}
          >
            {lunarDateStr}
          </View>
        )}
        <View
          className='calendar-extra-info'
          style={{
            color:
              extraInfoIndex === -1 || selected
                ? ''
                : extraInfoColor,
            fontSize:
              extraInfoIndex === -1
                ? ''
                : extraInfoFontSize,
            ...customStyles.extraInfoStyle,
          }}
        >
          {/* 额外信息 */}
          {extraInfoIndex === -1 ? '' :extraInfoText}
        </View>
      </View>
      {/* 标记 */}
      <View
        className='calendar-mark-wrapper'
      >
        {markText ?
          <View
            className='calendar-mark-text'
            style={{
              color: markIndex === -1 ? '' : markColor,
              fontSize: markIndex === -1 ? '' : markFontSize,
              ...customStyles.markStyle
            }}
          >
            {markText}
          </View>
          :
          <View
            className='calendar-mark'
            style={{
              backgroundColor: markIndex === -1 ? '' : markColor,
              height: markIndex === -1 ? '' : markSize,
              width: markIndex === -1 ? '' : markSize,
              ...customStyles.markStyle
            }}
          >
          </View>
        }
      </View>
    </View>
  );
}

export default React.memo(Day);
