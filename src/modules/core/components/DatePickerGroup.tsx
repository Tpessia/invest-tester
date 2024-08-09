import { getEndOfDay } from '@/modules/@utils';
import StandaloneAddon from '@/modules/core/components/StandaloneAddon';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import './DateRangeGroup.scss';

interface Props {
    maxDate?: Date;
    minDate?: Date;
    values: Date[];
    onChange: (values: Date[]) => void;
}

const DateRangeGroup: React.FC<Props> = (props) => {
    return (
        <div className='date-picker-group'>
          <StandaloneAddon addon='Dates' wrapperStyle={{ marginRight: '5px' }}/>
          <div className='date-picker-group-wrapper'>
            {props.values.map((value, index) => (
                <DatePicker
                    key={index}
                    style={{ flex: '1', marginRight: index === props.values.length - 1 ? 0 : '5px' }}
                    suffixIcon={null}
                    allowClear={false}
                    showNow={true}
                    minDate={props.minDate && dayjs(getEndOfDay(props.minDate))}
                    maxDate={props.maxDate && dayjs(getEndOfDay(props.maxDate))}
                    value={dayjs(value)}
                    onChange={date => props.onChange(props.values.map((value, i) => i === index ? date?.toDate() ?? value : value))}
                />
            ))}
          </div>
        </div>
    );
};

export default DateRangeGroup;
