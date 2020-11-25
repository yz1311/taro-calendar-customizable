import React, {FC} from 'react';
import {LunarInfo} from "../utils";
import {View} from '@tarojs/components';
import {
  CalendarDateInfo,
  CustomStyles,
  StyleGeneratorParams
} from "../days/index";
import {CalendarTools, formatDate, indexOf} from "../utils";

interface IProps {
  onDayLongPress?: ({value}: {value: string})=>void;
  selected: boolean;
  /** 点击事件回调 */
  onClick: (info: CalendarDateInfo) => any;
  value: CalendarDateInfo;
  /** 显示模式 普通/农历 */
  mode: 'normal' | 'lunar';
  /** 是否范围选择模式 */
  isMultiSelect: boolean;
  markIndex: number;
  extraInfoIndex: number;
  /** 范围 开始时间 **/
  startDateStr: string;
  /** 范围 结束时间 **/
  endDateStr: string;
  /** 是否显示分割线 */
  showDivider: boolean;
  /** 最小的可选时间 */
  minDate: string;
  /** 最大的可选时间 */
  maxDate?: string | undefined;
  /** 自定义样式生成器 */
  customStyleGenerator?: (dateInfo: StyleGeneratorParams) => CustomStyles;
  /** 选定的日期 */
  selectedDate: string;
  /** 选定时的背景色 */
  selectedDateColor?: string;
  markColor: string|undefined;
  markSize: string|undefined;
  extraInfoColor: string|undefined;
  extraInfoSize: string|undefined;
  extraInfoText: string|undefined;
}

const Day:FC<IProps> = (args)=>{
  const {selected, onDayLongPress, isMultiSelect, onClick, value, mode, markIndex,
    extraInfoIndex, startDateStr, endDateStr, minDate, maxDate, customStyleGenerator,
    selectedDate, selectedDateColor, markColor, markSize, extraInfoColor, extraInfoSize,
    extraInfoText,
    showDivider} = args;
  const startDateObj = new Date(startDateStr);
  const endDateObj = new Date(endDateStr);
  const minDateObj = new Date(minDate);
  // @ts-ignore
  const maxDateObj = new Date(maxDate ? maxDate : new Date());
  const today = formatDate(new Date(), 'day');
  let disable = false;
  let className: string[] = [];

  if (!value.currentMonth) {
    // 非本月
    className.push('not-this-month');
  }
  if (
    selected &&
    !(isMultiSelect && endDateStr)
  ) {
    // 选中
    // 范围选择模式显示已选范围时，不显示selected
    className.push('calendar-selected');
  }
  if (markIndex !== -1) {
    // 标记
    className.push('calendar-marked');
  }
  if (extraInfoIndex !== -1) {
    // 额外信息
    className.push('calendar-extra-info');
  }
  if (value.fullDateStr === today) {
    // 当天
    className.push('calendar-today');
  }
  if (showDivider) {
    // 分割线
    className.push('calendar-line-divider');
  }
  let isInRange = false;
  let rangeStart = false;
  let rangeEnd = false;
  if (isMultiSelect && endDateStr) {
    // 范围选择模式
    const valueDateTimestamp = new Date(value.fullDateStr).getTime();
    if (
      valueDateTimestamp >= startDateObj.getTime() &&
      valueDateTimestamp <= endDateObj.getTime()
    ) {
      // 被选择（范围选择）
      className.push('calendar-range');
      isInRange = true;
      if (valueDateTimestamp === startDateObj.getTime()) {
        // 范围起点
        rangeStart = true;
        className.push('calendar-range-start');
      }
      if (valueDateTimestamp === endDateObj.getTime()) {
        // 范围终点
        rangeEnd = true;
        className.push('calendar-range-end');
      }
    }
  }
  if (
    new Date(value.fullDateStr).getTime() < minDateObj.getTime() ||
    (maxDate &&
      new Date(value.fullDateStr).getTime() > maxDateObj.getTime())
  ) {
    className.push('not-this-month');
    disable = true;
  }
  let lunarDayInfo =
    mode === 'lunar'
      ? CalendarTools.solar2lunar(value.fullDateStr)
      : null;
  let lunarClassName = ['lunar-day'];
  if (lunarDayInfo) {
    if (lunarDayInfo.IDayCn === '初一') {
      lunarClassName.push('lunar-month');
    }
  }
  let customStyles: CustomStyles = {};
  if (customStyleGenerator) {
    // 用户定制样式
    const generatorParams: StyleGeneratorParams = {
      ...value,
      lunar: lunarDayInfo,
      selected: selectedDate === value.fullDateStr,
      multiSelect: {
        multiSelected: isInRange,
        multiSelectedStar: rangeStart,
        multiSelectedEnd: rangeEnd
      },
      marked: markIndex !== -1,
      hasExtraInfo: extraInfoIndex !== -1
    };
    customStyles = customStyleGenerator(generatorParams);
  }
  
  return (
    <View
      onLongPress={
        onDayLongPress
          ? () => onDayLongPress({ value: value.fullDateStr })
          : undefined
      }
      className={className.join(' ')}
      onClick={() => {
        if (!disable) {
          onClick(value);
        }
      }}
      style={customStyles.containerStyle}
    >
      <View

        className="calendar-date"
        style={
          customStyles.dateStyle || customStyles.dateStyle === {}
            ? customStyles.dateStyle
            : {
              backgroundColor:
                selectedDate === value.fullDateStr || isInRange
                  ? selectedDateColor
                  : ''
            }
        }
      >
        {/* 日期 */}
        {value.date}
      </View>
      {mode === 'normal' ? (
        ''
      ) : (
        <View
          className={lunarClassName.join(' ')}
          style={customStyles.lunarStyle}
        >
          {/* 农历 */}
          {(() => {
            if (!lunarDayInfo) {
              return;
            }
            lunarDayInfo = lunarDayInfo as LunarInfo;
            let dateStr: string;
            if (lunarDayInfo.IDayCn === '初一') {
              dateStr = lunarDayInfo.IMonthCn;
            } else {
              //@ts-ignore
              dateStr = lunarDayInfo.isTerm
                ? lunarDayInfo.Term
                : lunarDayInfo.IDayCn;
            }
            return dateStr;
          })()}
        </View>
      )}
      {/* 标记 */}
      <View
        className="calendar-mark"
        style={{
          backgroundColor: markIndex === -1 ? '' : markColor,
          height: markIndex === -1 ? '' : markSize,
          width: markIndex === -1 ? '' : markSize,
          top: mode === 'lunar' ? '2.0rem' : '1.5rem',
          ...customStyles.markStyle
        }}
      />
      {extraInfoIndex === -1 ? (
        ''
      ) : (
        <View
          className="calendar-extra-info"
          style={{
            color:
              extraInfoIndex === -1
                ? ''
                : extraInfoColor,
            fontSize:
              extraInfoIndex === -1
                ? ''
                : extraInfoSize,
            ...customStyles.extraInfoStyle
          }}
        >
          {/* 额外信息 */}
          {extraInfoText}
        </View>
      )}
    </View>
  );
}

export default React.memo(Day);
