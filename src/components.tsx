import {Button as Btn, ButtonProps, Image, Modal, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Fragment, useState} from 'react';
import {Menu, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';

import {ChannelDetails} from 'ldk-node/lib/classes/Bindings';
import {styles} from './styles';

export interface ChannelParams {
  nodeId: string;
  ip: string;
  port: string;
  amount: string;
  counterPartyAmount: string;
}

export const Button = ({loading, ...rest}: React.PropsWithChildren<ButtonProps & {loading?: boolean}>) => {
  return (
    <View style={styles.btn}>
      <Btn {...rest} color="white" />
    </View>
  );
};

export const Header = () => {
  return (
    <View style={styles.row}>
      <Text style={{fontWeight: '600'}}>Ldk Node React Native QuickStart</Text>
      <Image source={require('./assets/logo.png')} style={styles.img} />
    </View>
  );
};

export const MnemonicView = ({buildNodeCallback}: {buildNodeCallback: (m: string) => {}}) => {
  const [mnemonic, setMnemonic] = useState('awkward fox lawn senior flavor cook genuine cake endorse rare walk this');
  return (
    <View>
      <Text style={styles.boldText}>Enter Menmonic</Text>
      <TextInput multiline style={styles.responseBox} onChangeText={setMnemonic} value={mnemonic} />
      {mnemonic != '' && <Button title="Build and Start Node" onPress={() => buildNodeCallback(mnemonic)} />}
    </View>
  );
};

export const OpenChannelModal = ({openChannelCallback, cancelCallback}: {openChannelCallback: ({}: ChannelParams) => {}; cancelCallback: any}) => {
  const [channelDetails, setChannelDetails] = useState({
    nodeId: '03ccdc462d7f5d5328c3a13bc18b5cf696295ca71a14698c70aa8402ea0dd33d1a',
    ip: '192.168.8.100',
    port: '9735',
    amount: '20000',
    counterPartyAmount: '150',
  });

  const updateDetails = (key: any, value: any) => {
    setChannelDetails(st => ({...st, [key]: value}));
  };

  let showSubmit = channelDetails.amount && channelDetails.counterPartyAmount && channelDetails.ip && channelDetails.nodeId && channelDetails.port;

  return (
    <Modal transparent={true}>
      <View style={styles.modelContainer}>
        <View style={styles.modalView}>
          <Text style={styles.boldText}>Open Channel</Text>
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
          <View style={styles.row}>
            <Button title="Cancel" onPress={cancelCallback} />
            {showSubmit && <Button title="Submit" onPress={() => openChannelCallback(channelDetails)} />}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const ChannelsListView = ({channels}: {channels: Array<ChannelDetails> | undefined}) => {
  if (channels?.length == 0) return <Text style={{alignSelf: 'center'}}>No Open Channels</Text>;
  return (
    <Fragment>
      {channels?.map((channel, index) => {
        return (
          <View key={index} style={styles.channelListView}>
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
              <Text>{channel.balanceMsat} SATS</Text>
            </View>
            <TouchableOpacity style={styles.channelSideView}>
              <Menu>
                <MenuTrigger>
                  <Text style={styles.menuItem}>...</Text>
                </MenuTrigger>
                <MenuOptions>
                  <MenuOption onSelect={() => alert(`Save`)} text="Receive" />
                  <MenuOption onSelect={() => alert(`Delete`)} text="Send" />
                  <MenuOption onSelect={() => alert(`Not called`)} text="Close Channel" />
                </MenuOptions>
              </Menu>
            </TouchableOpacity>
          </View>
        );
      })}
    </Fragment>
  );
};
