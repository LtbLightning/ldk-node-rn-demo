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
  InvoiceModal,
  MnemonicView,
  OpenChannelModal,
  PaymentModal,
  ReceiveModal,
  satsToMsats,
} from './components';

import RNFS from 'react-native-fs';
import {MenuProvider} from 'react-native-popup-menu';
import {styles} from './styles';
import {addressToString} from 'ldk-node-rn/lib/utils';

let docDir = RNFS.DocumentDirectoryPath + '/NEW_LDK_NODE/' + `${Platform.Version}/`;
console.log('Platform Version=====>', `${Platform.Version}`);

let host;
// let port = 30000; // Port for Esplora server
let port = 39735;
let esploaraServer;

if (Platform.OS === 'android') {
  // host = '127.0.0.1';
  // host = '192.168.0.216';
  host = '0.0.0.0';
  // host = '10.0.1.1';
} else if (Platform.OS === 'ios') {
  // host = '127.0.0.1';
  host = '0.0.0.0';
  // host = '44.219.111.31';
}

// esploaraServer = `http://${host}:${port}`;
esploaraServer = `https://mutinynet.ltbl.io/api`;
// esploaraServer = `https://mutinynet.com/api/`;
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
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoice, setInvoice] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  const buildNode = async (mnemonic: string) => {
    try {
      const storagePath = docDir;
      console.log('storagePath====>', storagePath);
      const ldkPort = Platform.OS === 'ios' ? (Platform.Version == '17.0' ? 2000 : 2001) : 8081;
      // const ldkPort = 9735;
      const config = await new Config().create(storagePath, docDir + 'logs', 'signet', [new NetAddress(host, ldkPort)]);
      // const config = await new Config().create(storagePath, docDir + 'logs', 'bitcoin', [new NetAddress(host, 9735)]);
      // console.log('---config--- ', config);
      const builder = await new Builder().fromConfig(config);
      await builder.setNetwork('signet');
      await builder.setEsploraServer(esploaraServer);
      // await builder.setGossipSourceRgs('https://scorer.mutinywallet.com/v1/rgs/snapshot/');
      const key = await builder.setEntropyBip39Mnemonic(mnemonic);
      console.log('---Key--- ', key);
      // await builder.setLiquiditySourceLsps2('44.219.111.31:39735', '02b70a0161e9db0b1d8d71ad49ad54238e34c60e3f0cdbae66c9b9d8732088604e', 'JZWN9YLW');
      await builder.setLiquiditySourceLsps2('44.219.111.31:39735', '0371d6fd7d75de2d0372d03ea00e8bacdacb50c27d0eaea0a76a0622eff1f5ef2b', 'JZWN9YLW');

      const nodeObj: Node = await builder.build();

      setNode(nodeObj);

      const started = await nodeObj.start();
      setStarted(started);

      if (started) {
        console.log('Node started successfully');
      } else {
        console.log('Node failed to start');
      }

      /*=====Get/Set Node Info*/
      const nodeId = await nodeObj.nodeId();
      const listeningAddr = await nodeObj.listeningAddresses();
      setNodeInfo({nodeId: nodeId.keyHex, listeningAddress: `${listeningAddr?.map(i => addressToString(i))}`});
      console.log('Node Info:', {nodeId: nodeId.keyHex, listeningAddress: `${listeningAddr?.map(i => addressToString(i))}`});
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
      const balance = await node?.totalOnchainBalanceSats();
      setBalance(balance);
      console.log('On-chain balance:', balance);
    } catch (e) {
      console.error('Error getting on-chain balance:', e);
    }
  };

  const newOnchainAddress = async () => {
    try {
      let addr = await node?.newOnchainAddress();
      setOnChainAddress(addr?.addressHex);
      console.log('New on-chain address:', addr?.addressHex);
    } catch (e) {
      console.error('Error generating new on-chain address:', e);
    }
  };

  const openChannelCallback = async (params: ChannelParams) => {
    try {
      console.log(params);
      let addr = new NetAddress(params.ip, parseInt(params.port));
      console.log(addr);

      let opened = await node?.connectOpenChannel(
        params.nodeId,
        addr,
        parseInt(params.amount),
        satsToMsats(parseInt(params.counterPartyAmount)),
        null,
        true,
      );
      setShowChannelModal(false);
      console.log('Channel opened:', opened);
    } catch (e) {
      console.error('Error opening channel:', JSON.stringify(e));
    }
  };

  const listChannels = async () => {
    try {
      const list = await node?.listChannels();
      setChannels(list);
      console.log('Channels:', list);
      list.forEach(channel => {
        console.log('Channel details:', channel);
      });
    } catch (e) {
      console.error('Error listing channels:', e);
    }
  };

  const handleMenuItemCallback = async (index: number, channelIndex: number) => {
    setSelectedPaymentIndex(index);
    if (index > 0) {
      setShowPaymentModal(true);
    } else {
      let currentChannel = channels[channelIndex];

      try {
        const data = await node?.closeChannel({channelIdHex: currentChannel?.userChannelId.userChannelIdHex}, currentChannel?.counterpartyNodeId);
        console.log('Channel closed:', data);
      } catch (error) {
        console.error('Error closing channel:', error);
      }

      await listChannels();
    }
  };

  const handleReceive = async (amount: string) => {
    if (node && amount) {
      try {
        const invoice = await node.receivePayment(satsToMsats(parseInt(amount, 10)), 'Test Memo', 150);
        setInvoice(JSON.stringify(invoice).replace(/"/g, ''));
        setShowReceiveModal(false);
        setReceiveAmount('');
        setShowInvoiceModal(true);
        console.log('Invoice generated:', invoice);
      } catch (e) {
        console.error('Error receiving payment:', e);
      }
    }
  };

  const handleReceiveBolt11Payment = async (amount: string) => {
    if (node && amount) {
      try {
        const invoice = await node.receiveViaJitChannel(satsToMsats(parseInt(amount, 10)), 'test', 3600);
        // const invoice = await node.receiveViaJitChannel(parseInt(amount), 'test', 3600);
        setInvoice(JSON.stringify(invoice).replace(/"/g, ''));
        setShowReceiveModal(false);
        setReceiveAmount('');
        setShowInvoiceModal(true);
        console.log('Invoice generated:', invoice);
      } catch (e) {
        console.error('Error receiving payment:', e);
      }
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
    console.log('Channel config set:', channelConfig);
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
                <Button
                  title="Receive via Lightning"
                  onPress={() => {
                    // Set the amount to an empty string when opening the modal
                    setReceiveAmount('');
                    setShowReceiveModal(true);
                  }}
                />

                <Button title="List Channels" onPress={listChannels} />
                <View style={styles.row}>
                  <Text style={styles.boldNormal}>Channels</Text>
                  <IconButton onPress={() => setShowChannelModal(true)} title=" + Channel" />
                </View>
                <ChannelsListView channels={channels} menuItemCallback={handleMenuItemCallback} />
                <ReceiveModal
                  visible={showReceiveModal}
                  amount={receiveAmount} // Pass the amount to ReceiveModal
                  onClose={() => {
                    setReceiveAmount(''); // Reset the amount when the modal is closed
                    setShowReceiveModal(false);
                    console.log('Receive modal closed');
                  }}
                  onReceive={amount => {
                    handleReceiveBolt11Payment(amount);
                    // handleReceive(amount); // Pass the amount to handleReceive
                    setShowReceiveModal(false); // Close the modal
                    console.log('Receive modal amount received:', amount);
                  }}
                />

                <InvoiceModal visible={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} invoice={invoice} />
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
