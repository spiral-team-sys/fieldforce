import React, { useState } from 'react';
import { View, Button } from 'react-native';
//import DatePicker from 'react-native-date-picker';

const calendarView = () => {
  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onConfirm = selectedDate => {
    setDate(selectedDate);
    setShow(false);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View>
      <View>
        <Button onPress={showDatepicker} title="Show date picker!" />
      </View>
      <View>
        <Button onPress={showTimepicker} title="Show time picker!" />
      </View>
      <DatePicker
        modal
        open={show}
        date={date}
        mode={mode}
        onConfirm={onConfirm}
        onCancel={() => setShow(false)}
      />
    </View>
  );
};

export default calendarView;
