import {Button as Btn, ButtonProps, Image, Modal, Pressable, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Fragment, useState} from 'react';
import {Menu, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';

import {ChannelDetails} from 'ldk-node/lib/classes/Bindings';
import {Node} from 'ldk-node';
import {AppColors, styles} from './styles';
import {host} from './App';

export interface ChannelParams {
  nodeId: string;
  ip: string;
  port: string;
  amount: string;
  counterPartyAmount: string;
}

const menuItems = ['Close', 'Send', 'Receive'];

export const Button = ({loading, style, title, ...rest}: React.PropsWithChildren<ButtonProps & {loading?: boolean; style?: any}>) => {
  return (
    <TouchableOpacity style={{...styles.btn, ...style}} {...rest}>
      <Text style={{color: 'white', fontSize: 17}}>{title}</Text>
    </TouchableOpacity>
  );
};

export const Header = () => {
  return (
    <View style={{...styles.row, paddingHorizontal: 25}}>
      <Image source={require('./assets/react-logo.png')} style={styles.img} resizeMode="contain" />
      <Text style={{fontWeight: '700', fontSize: 15, textAlign: 'center'}}>{`Demo App \n Ldk Node React Native`}</Text>
      <Image source={require('./assets/logo.png')} style={styles.img} />
    </View>
  );
};

export const MnemonicView = ({buildNodeCallback}: {buildNodeCallback: Function}) => {
  const [mnemonic, setMnemonic] = useState('');
  return (
    <View>
      <Text style={styles.boldText}>Enter Menmonic</Text>
      <TextInput multiline style={styles.responseBox} onChangeText={setMnemonic} value={mnemonic} />
      {mnemonic != '' && <Button title="Build and Start Node" onPress={() => buildNodeCallback(mnemonic)} />}
    </View>
  );
};

export const IconButton = ({onPress, title, style, disabled}: {onPress: any; title: string; style?: any; disabled?: boolean}) => {
  return (
    <TouchableOpacity style={{...styles.smallButton, ...style}} onPress={onPress} disabled={disabled} activeOpacity={disabled ? 1 : 0.7}>
      <Text style={{color: disabled ? '#999' : 'black'}}>{title}</Text>
    </TouchableOpacity>
  );
};

export const OpenChannelModal = ({openChannelCallback, cancelCallback}: {openChannelCallback: ({}: ChannelParams) => {}; cancelCallback: any}) => {
  const [channelDetails, setChannelDetails] = useState({
    nodeId: '',
    ip: '',
    port: '',
    amount: '',
    counterPartyAmount: '',
  });

  const updateDetails = (key: any, value: any) => {
    setChannelDetails(st => ({...st, [key]: value}));
  };

  let showSubmit = channelDetails.amount && channelDetails.counterPartyAmount && channelDetails.ip && channelDetails.nodeId && channelDetails.port;

  return (
    <ModalView>
      <Fragment>
        <IconButton onPress={cancelCallback} title="X" style={styles.closeButton} />
        <Text style={{...styles.leftAlign, ...styles.boldNormal}}>Open Channel</Text>
        <TextInput style={styles.textInput} placeholder="Node Id" onChangeText={e => updateDetails('nodeId', e)} value={channelDetails.nodeId} />
        <TextInput style={styles.textInput} placeholder="Ip Address" onChangeText={e => updateDetails('ip', e)} value={channelDetails.ip} />
        <TextInput style={styles.textInput} placeholder="Port" onChangeText={e => updateDetails('port', e)} value={channelDetails.port} />
        <TextInput style={styles.textInput} placeholder="Amount" onChangeText={e => updateDetails('amount', e)} value={channelDetails.amount} />
        <TextInput
          style={styles.textInput}
          placeholder="CounterPartyAmount"
          onChangeText={e => updateDetails('counterPartyAmount', e)}
          value={channelDetails.counterPartyAmount}
        />
        {showSubmit && <Button title="Submit" style={styles.fullWidthBtn} onPress={() => openChannelCallback(channelDetails)} />}
      </Fragment>
    </ModalView>
  );
};

export const ModalView = (props: any) => {
  return (
    <Modal transparent={true}>
      <View style={styles.modelContainer}>
        <View style={styles.modalView}>{props.children}</View>
      </View>
    </Modal>
  );
};

export const ChannelsListView = ({channels, menuItemCallback}: {channels: Array<ChannelDetails> | undefined; menuItemCallback: Function}) => {
  if (!channels?.length) return <Text style={{alignSelf: 'center'}}>No Open Channels</Text>;
  return (
    <Fragment>
      {channels?.map((channel, channelIndex) => {
        let isReady = channel.isChannelReady && channel.isUsable;
        return (
          <View key={channelIndex} style={{...styles.channelListView, backgroundColor: channelIndex % 2 == 0 ? AppColors.grey : 'white'}}>
            <View style={styles.channelSideView}>
              {isReady ? (
                <Image source={require('./assets/complete.png')} style={styles.channelIcon} />
              ) : (
                <Image source={require('./assets/waiting.png')} style={styles.channelIcon} />
              )}
              <Text>{`${channel.confirmations} / ${channel.confirmationsRequired}`}</Text>
            </View>
            <View style={styles.channelMainView}>
              <Text style={{fontSize: 12, fontWeight: 'bold'}}>{channel.channelId.channelIdHex}</Text>
              <View>
                <BoxRow title="Local" value={channel.balanceMsat} color={AppColors.green} />
                <View style={{flexDirection: 'row'}}>
                  <BoxRow title="Capacity" value={channel.inboundCapacityMsat} color={AppColors.blue} />
                  <Text> </Text>
                  <BoxRow title="Outbound" value={channel.outboundCapacityMsat} color={AppColors.blue} />
                </View>
              </View>
              <View style={{flexDirection: 'row', marginVertical: 5}}>
                <IconButton onPress={() => menuItemCallback(1, channelIndex)} title="Send" style={styles.channelButton} disabled={!isReady} />
                <IconButton onPress={() => menuItemCallback(2, channelIndex)} title="Receive" style={styles.channelButton} disabled={!isReady} />
                <IconButton onPress={() => menuItemCallback(0, channelIndex)} title="Close" style={styles.channelButton} disabled={!isReady} />
              </View>
            </View>
          </View>
        );
      })}
    </Fragment>
  );
};

export const PaymentModal = ({index, hide, node}: {index: number; hide: Function; node: Node | undefined}) => {
  const [value, setValue] = useState('');
  const [response, setResponse] = useState<any>();
  const isSend = index == 1;
  const handleSubmit = async () => {
    setValue('');
    let res = isSend ? await node?.sendPayment(value) : await node?.receivePayment(parseInt(value), 'Test Memo', 150);
    setResponse(JSON.stringify(res));
  };
  return (
    <ModalView>
      <IconButton onPress={hide} title="X" style={styles.closeButton} />
      <Text style={{...styles.leftAlign, ...styles.boldText}}>{menuItems[index]}</Text>
      <TextInput style={styles.textInput} placeholder={isSend ? 'Invoice' : 'Amount'} onChangeText={setValue} value={value} multiline />
      <Button title="Submit" style={styles.fullWidthBtn} onPress={handleSubmit} />
      <Text selectable>{response}</Text>
    </ModalView>
  );
};

export const BoxRow = ({title, value, color}: {title: string; value: any; color?: string}) => {
  return (
    <View style={styles.boxRow}>
      <Text style={{...styles.boldNormal, color: color ?? 'black'}}>{`${title}: `}</Text>
      <Text selectable style={{color: color ?? 'black', fontSize: 12}}>
        {value}
      </Text>
    </View>
  );
};
