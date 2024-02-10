import {Builder, ChannelConfig, Config, Node} from 'ldk-node-rn';
import {ChannelDetails, NetAddress} from 'ldk-node-rn/lib/classes/Bindings';
import {Fragment, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View, ImageBackground} from 'react-native';
import {
  BoxRow,
  Button,
  ChannelParams,
  ChannelsListView,
  Header,
  IconButton,
  MnemonicView,
  OpenChannelModal,
  PaymentModal,
  satsToMsats,
} from './components';

import RNFS from 'react-native-fs';
import {MenuProvider} from 'react-native-popup-menu';
import {styles} from './styles';
import {addressToString} from 'ldk-node-rn/lib/utils';

let docDir = RNFS.DocumentDirectoryPath + '/LDK_NODE/';
export let host = '127.0.0.1';
let port = 30000;
let esploaraServer = `http://192.168.1.203:${port}`;
// esploaraServer = `https://mempool.space/testnet/api`;

export const App = (): JSX.Element => {
  const [started, setStarted] = useState(false);
  const [node, setNode] = useState<Node>();
  const [nodeInfo, setNodeInfo] = useState({nodeId: '', listeningAddress: ''});
  const [balance, setBalance] = useState<any>('0.0');
  const [onChainAddress, setOnChainAddress] = useState<any>(' ');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);

  const [channels, setChannels] = useState<Array<ChannelDetails>>();

  const buildNode = async (mnemonic: string) => {
    try {
      const storagePath = docDir;
      console.log('Storage Path: ', storagePath);
      const config = await new Config().create(storagePath, docDir + 'logs', 'regtest', [new NetAddress(host, 2000)]);
      const builder = await new Builder().fromConfig(config);
      await builder.setEsploraServer(esploaraServer);

      await builder.setEntropyBip39Mnemonic(mnemonic);
      const nodeObj: Node = await builder.build();
      setNode(nodeObj);
      setStarted(await nodeObj.start());

      /*=====Get/Set Node Info*/
      let nodeId = await nodeObj.nodeId();
      let listeningAddr = await nodeObj.listeningAddresses();
      console.log('Listening Addresses android:', listeningAddr);
      setNodeInfo({nodeId: nodeId.keyHex, listeningAddress: `${listeningAddr?.map(i => addressToString(i))}`});
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
      let opened = await node?.connectOpenChannel(
        params.nodeId,
        addr,
        parseInt(params.amount),
        satsToMsats(parseInt(params.counterPartyAmount)),
        null,
        true,
      );
      console.log('Channel opened', opened);
      setShowChannelModal(false);
    } catch (e) {
      console.log('Error in opening channel:', e);
    }
  };

  const listChannels = async () => {
    try {
      const list = await node?.listChannels();
      console.log('Channels===>', list);
      setChannels(list);
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  const handleMenuItemCallback = async (index: number, channelIndex: number) => {
    setSelectedPaymentIndex(index);
    if (index > 0) {
      setShowPaymentModal(true);
    } else {
      let currentChannel = channels[channelIndex];
      await node?.closeChannel(currentChannel?.channelId, currentChannel.counterpartyNodeId);
      await listChannels();
    }
  };

  const testChannelConfig = async () => {
    console.log('Is Node Runnning:: ', await node?.isRunning());

    let channelConfig = await new ChannelConfig().create();
    console.log('acceptUnderpayingHtlcs:: ', await channelConfig.acceptUnderpayingHtlcs());
    console.log('cltvExpiryDelta:: ', await channelConfig.cltvExpiryDelta());
    console.log('forceCloseAvoidanceMaxFeeSatoshis:: ', await channelConfig.forceCloseAvoidanceMaxFeeSatoshis());
    console.log('forwardingFeeBaseMsat:: ', await channelConfig.forwardingFeeBaseMsat());
    console.log('forwardingFeeProportionalMillionths:: ', await channelConfig.forwardingFeeProportionalMillionths());

    await channelConfig.setAcceptUnderpayingHtlcs(true);
    await channelConfig.setCltvExpiryDelta(150);
    await channelConfig.setForceCloseAvoidanceMaxFeeSatoshis(40800);
    await channelConfig.setForwardingFeeBaseMsat(4000);
    await channelConfig.setForwardingFeeProportionalMillionths(4000);
    await channelConfig.setMaxDustHtlcExposureFromFeeRateMultiplier(4000);
    await channelConfig.setMaxDustHtlcExposureFromFixedLimit(4000);

    console.log('acceptUnderpayingHtlcs:: ', await channelConfig.acceptUnderpayingHtlcs());
    console.log('cltvExpiryDelta:: ', await channelConfig.cltvExpiryDelta());
    console.log('forceCloseAvoidanceMaxFeeSatoshis:: ', await channelConfig.forceCloseAvoidanceMaxFeeSatoshis());
    console.log('forwardingFeeBaseMsat:: ', await channelConfig.forwardingFeeBaseMsat());
    console.log('forwardingFeeProportionalMillionths:: ', await channelConfig.forwardingFeeProportionalMillionths());
  };

  return (
    <ImageBackground source={require('./assets/background.png')} style={styles.backgroundImage}>
      <MenuProvider>
        <SafeAreaView style={styles.safeArea}>
          <Header />
          <View style={styles.container}>
            {!started ? (
              <MnemonicView buildNodeCallback={buildNode} />
            ) : (
              <ScrollView style={{minHeight: '100%'}}>
                <View style={styles.responseBox}>
                  <Text style={styles.balanceText}>{balance / 100000000} BTC</Text>
                  <BoxRow title="Listening Address" value={nodeInfo.listeningAddress} />
                  <BoxRow title="Node ID" value={nodeInfo.nodeId} />
                  <BoxRow title="Funding Address" value={onChainAddress} />
                </View>

                <Button title="On Chain Balance" onPress={onChainBalance} />
                <Button title="New Funding Address" onPress={newOnchainAddress} />
                <Button title="List Channels" onPress={listChannels} />
                <View style={styles.row}>
                  <Text style={styles.boldNormal}>Channels</Text>
                  <IconButton onPress={() => setShowChannelModal(true)} title=" + Channel" />
                </View>
                <ChannelsListView channels={channels} menuItemCallback={handleMenuItemCallback} />
              </ScrollView>
            )}
          </View>
          {showChannelModal && <OpenChannelModal openChannelCallback={openChannelCallback} cancelCallback={() => setShowChannelModal(false)} />}
          {showPaymentModal && <PaymentModal index={selectedPaymentIndex} hide={() => setShowPaymentModal(false)} node={node} />}
        </SafeAreaView>
      </MenuProvider>
    </ImageBackground>
  );
};
