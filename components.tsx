import {Button as Btn, ButtonProps, View} from 'react-native';

export const Button = (props: React.PropsWithChildren<ButtonProps>) => {
  return (
    <View style={{marginVertical: 4}}>
      <Btn {...props} />
    </View>
  );
};
