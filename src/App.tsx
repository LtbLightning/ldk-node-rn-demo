import {Builder, ChannelConfig, Config, Node} from 'ldk-node-rn';
import {ChannelDetails, NetAddress} from 'ldk-node-rn/lib/classes/Bindings';
import {Fragment, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View, ImageBackground, Platform} from 'react-native';
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

let docDir = RNFS.DocumentDirectoryPath + '/NEW_LDK_NODE/' + `${Platform.Version}/`;
let host;
let port = 30000; // Port for Esplora server
let esploaraServer;

if (Platform.OS === 'android') {
  // host = '127.0.0.1';
  // host = '192.168.0.216';
  host = '0.0.0.0';
  // host = '10.0.1.1';
} else if (Platform.OS === 'ios') {
  host = '127.0.0.1';
}

esploaraServer = `http://${host}:${port}`;

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
      const ldkPort = Platform.OS === 'ios' ? (Platform.Version == '17.0' ? 2000 : 2001) : 8081;
      const config = await new Config().create(storagePath, docDir + 'logs', 'regtest', [new NetAddress(host, ldkPort)]);
      const builder = await new Builder().fromConfig(config);
      await builder.setEsploraServer(esploaraServer);

      await builder.setEntropyBip39Mnemonic(mnemonic);

      const nodeObj: Node = await builder.build();

      setNode(nodeObj);

      const started = await nodeObj.start();
      setStarted(started);

      if (started) {
      } else {
      }

      /*=====Get/Set Node Info*/
      const nodeId = await nodeObj.nodeId();
      const listeningAddr = await nodeObj.listeningAddresses();
      setNodeInfo({nodeId: nodeId.keyHex, listeningAddress: `${listeningAddr?.map(i => addressToString(i))}`});
    } catch (e) {
      console.error('Error in starting and building Node:', e);
      if (e.response) {
        console.error('Response error:', e.response.data);
      }
      if (e.request) {
        console.error('Request error:', e.request);
      }
    }
  };

  const onChainBalance = async () => {
    try {
      await node?.syncWallets();
      setBalance(await node?.totalOnchainBalanceSats());
    } catch (e) {}
  };

  const newOnchainAddress = async () => {
    try {
      let addr = await node?.newOnchainAddress();
      setOnChainAddress(addr?.addressHex);
    } catch (e) {}
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
      setShowChannelModal(false);
    } catch (e) {}
  };

  const listChannels = async () => {
    try {
      const list = await node?.listChannels();
      setChannels(list);
      list.forEach(channel => {});
    } catch (e) {}
  };

  const handleMenuItemCallback = async (index: number, channelIndex: number) => {
    setSelectedPaymentIndex(index);
    if (index > 0) {
      setShowPaymentModal(true);
    } else {
      let currentChannel = channels[channelIndex];

      try {
        const data = await node?.closeChannel({channelIdHex: currentChannel?.userChannelId.userChannelIdHex}, currentChannel?.counterpartyNodeId);
      } catch (error) {}

      await listChannels();
    }
  };

  const testChannelConfig = async () => {
    let channelConfig = await new ChannelConfig().create();

    await channelConfig.setAcceptUnderpayingHtlcs(true);
    await channelConfig.setCltvExpiryDelta(150);
    await channelConfig.setForceCloseAvoidanceMaxFeeSatoshis(40800);
    await channelConfig.setForwardingFeeBaseMsat(4000);
    await channelConfig.setForwardingFeeProportionalMillionths(4000);
    await channelConfig.setMaxDustHtlcExposureFromFeeRateMultiplier(4000);
    await channelConfig.setMaxDustHtlcExposureFromFixedLimit(4000);
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
