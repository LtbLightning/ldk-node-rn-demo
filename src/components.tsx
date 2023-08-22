import {Button as Btn, ButtonProps, Image, Modal, Pressable, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Fragment, useState} from 'react';
import {Menu, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';

import {ChannelDetails} from 'ldk-node/lib/classes/Bindings';
import {Node} from 'ldk-node';
import {styles} from './styles';
import { host } from './App';

export interface ChannelParams {
  nodeId: string;
  ip: string;
  port: string;
  amount: string;
  counterPartyAmount: string;
}

const menuItems = ['Close', 'Send', 'Receive'];

export const Button = ({loading, style, ...rest}: React.PropsWithChildren<ButtonProps & {loading?: boolean; style?: any}>) => {
  return (
    <View style={{...styles.btn, ...style}}>
      <Btn {...rest} color="white" />
    </View>
  );
};

export const Header = () => {
  return (
    <View style={styles.row}>
      <Image source={require('./assets/react-logo.png')} style={styles.img} resizeMode='contain' />
      <Text style={{fontWeight: '900', fontSize: 17}}>Ldk Node React Native Demo</Text>
      <Image source={require('./assets/logo.png')} style={styles.img} />
    </View>
  );
};

export const MnemonicView = ({buildNodeCallback}: {buildNodeCallback: Function}) => {
  const [mnemonic, setMnemonic] = useState('awkward fox lawn senior flavor cook genuine cake endorse rare walk this');
  return (
    <View>
      <Text style={styles.boldText}>Enter Menmonic</Text>
      <TextInput multiline style={styles.responseBox} onChangeText={setMnemonic} value={mnemonic} />
      {mnemonic != '' && <Button title="Build and Start Node" onPress={() => buildNodeCallback(mnemonic)} />}
    </View>
  );
};

export const IconButton = ({onPress, title, style}: {onPress: any; title: string; style?: any}) => {
  return (
    <TouchableOpacity style={{...styles.plusButton, ...style}} onPress={onPress}>
      <Text style={styles.boldText}>{title}</Text>
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
        <Text style={{...styles.leftAlign, ...styles.boldText}}>Open Channel</Text>
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
  if (channels?.length == 0) return <Text style={{alignSelf: 'center'}}>No Open Channels</Text>;
  return (
    <Fragment>
      {channels?.map((channel, channelIndex) => {
        return (
          <View key={channelIndex} style={styles.channelListView}>
            <View style={styles.channelSideView}>
              {channel.isChannelReady && channel.isUsable ? (
                <Image source={require('./assets/complete.png')} style={styles.channelIcon} />
              ) : (
                <Image source={require('./assets/waiting.png')} style={styles.channelIcon} />
              )}
              <Text>{`${channel.confirmations} / ${channel.confirmationsRequired}`}</Text>
            </View>
            <View style={styles.channelMainView}>
              <Text style={styles.boldText}>{channel.channelId.channelIdHex}</Text>
              <Text>Balance: {channel.balanceMsat} SATS</Text>
              <Text>Outbond Capacity: {channel.outboundCapacityMsat} MSATS</Text>
            </View>
            <TouchableOpacity style={styles.channelSideView}>
              {channel?.isChannelReady && (
                <Menu>
                  <MenuTrigger>
                    <Text style={styles.menuItem}>...</Text>
                  </MenuTrigger>
                  <MenuOptions>
                    {menuItems.map((item, index) => (
                      <MenuOption onSelect={() => menuItemCallback(index, channelIndex)} text={item} key={index} />
                    ))}
                  </MenuOptions>
                </Menu>
              )}
            </TouchableOpacity>
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
