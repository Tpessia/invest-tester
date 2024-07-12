import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import React from 'react';
import './DateRangePicker.scss';

const DateRangePicker: React.FC<RangePickerProps> = (props) => {
    return (
        <div className='datePickerWrapper'>
            <DatePicker.RangePicker {...props} />
        </div>
    );
};

export default DateRangePicker;
