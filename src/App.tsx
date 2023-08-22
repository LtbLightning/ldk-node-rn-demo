import {Builder, Config, Node} from 'ldk-node';
import {ChannelDetails, NetAddress} from 'ldk-node/lib/classes/Bindings';
import {Fragment, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {Button, ChannelParams, ChannelsListView, Header, IconButton, MnemonicView, OpenChannelModal, PaymentModal} from './components';

import RNFS from 'react-native-fs';
import {MenuProvider} from 'react-native-popup-menu';
import {styles} from './styles';

let docDir = RNFS.DocumentDirectoryPath + '/';
export let host = '127.0.0.1';
let port = 30000;
let esploaraServer = `http://${host}:${port}`;

export const App = (): JSX.Element => {
  const [started, setStarted] = useState(false);
  const [node, setNode] = useState<Node>();
  const [nodeInfo, setNodeInfo] = useState({nodeId: '', listeningAddress: ''});
  const [balance, setBalance] = useState<any>('0.0');
  const [onChainAddress, setOnChainAddress] = useState<any>();
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);

  const [channels, setChannels] = useState<Array<ChannelDetails>>();

  const buildNode = async (mnemonic: string) => {
    try {
      const config = await new Config().create(docDir + 'node1', 'regtest', new NetAddress(host, 2000));
      const builder = await new Builder().fromConfig(config);
      await builder.setEsploraServer(esploaraServer);
      await builder.setEntropyBip39Mnemonic(mnemonic);

      const nodeObj: Node = await builder.build();
      setNode(nodeObj);
      setStarted(await nodeObj.start());

      /*=====Get/Set Node Info*/
      let nodeId = await nodeObj.nodeId();
      let listeningAddr = await nodeObj.listeningAddress();
      setNodeInfo({nodeId: nodeId.keyHex, listeningAddress: `${listeningAddr?.ip}: ${listeningAddr?.port}`});
    } catch (e) {
      console.log('Error in starting and build Node:', e);
    }
  };

  const onChainBalance = async () => {
    try {
      await node?.syncWallets();
      setBalance(await node?.totalOnchainBalanceSats());
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  const newOnchainAddress = async () => {
    try {
      let addr = await node?.newOnchainAddress();
      setOnChainAddress(addr?.addressHex);
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  const openChannelCallback = async (params: ChannelParams) => {
    try {
      let addr = new NetAddress(params.ip, parseInt(params.port));
      // await node?.connect(params.nodeId, addr, false);
      let opened = await node?.connectOpenChannel(params.nodeId, addr, parseInt(params.amount), parseInt(params.counterPartyAmount), null, true);
      console.log('Channel opened', opened);
      setShowChannelModal(false);
    } catch (e) {
      console.log('Error in opening channel:', e);
    }
  };

  const listChannels = async () => {
    try {
      const list = await node?.listChannels();
      console.log('Channels', list);
      setChannels(list);
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  const handleMenuItemCallback = async (index: number, channelIndex: number) => {
    setSelectedPaymentIndex(index);
    if (index > 0) setShowPaymentModal(true);
    else {
      let currentChannel = channels[channelIndex];
      await node?.closeChannel(currentChannel?.channelId, currentChannel.counterpartyNodeId);
      await listChannels();
    }
  };

  return (
    <MenuProvider>
      <SafeAreaView style={{paddingBottom: 70}}>
        <Header />
        <View style={styles.container}>
          {!started ? (
            <MnemonicView buildNodeCallback={buildNode} />
          ) : (
            <ScrollView>
              <Text style={styles.greenText}>Node started successfully....</Text>
              <View style={styles.responseBox}>
                <Text style={styles.balanceText}>{balance / 100000000} BTC</Text>
                <Text>Listening Address: {nodeInfo.listeningAddress}</Text>
                <Text>Node ID:</Text>
                <Text selectable>{nodeInfo.nodeId}</Text>
                {onChainAddress && (
                  <Fragment>
                    <Text>New Address:</Text>
                    <Text selectable>{onChainAddress}</Text>
                  </Fragment>
                )}
              </View>

              <Button title="On Chain Balance" onPress={onChainBalance} />
              <Button title="New Funding Address" onPress={newOnchainAddress} />
              <Button title="List Channels" onPress={listChannels} />
              <View style={styles.row}>
                <Text style={styles.boldText}>Channels</Text>
                <IconButton onPress={() => setShowChannelModal(true)} title="+" />
              </View>
              <ChannelsListView channels={channels} menuItemCallback={handleMenuItemCallback} />
            </ScrollView>
          )}
        </View>
        {showChannelModal && <OpenChannelModal openChannelCallback={openChannelCallback} cancelCallback={() => setShowChannelModal(false)} />}
        {showPaymentModal && <PaymentModal index={selectedPaymentIndex} hide={() => setShowPaymentModal(false)} node={node} />}
      </SafeAreaView>
    </MenuProvider>
  );
};
