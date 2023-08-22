import {StyleSheet} from 'react-native';

export const AppColors = {blue: '#00bbf9', grey: '#FAFAFA'};

export const styles = StyleSheet.create({
  container: {padding: 10, backgroundColor: AppColors.grey},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  img: {width: 50, height: 50},
  responseBox: {
    borderWidth: 4,
    borderColor: AppColors.blue,
    padding: 20,
    backgroundColor: '#BDEFFF',
    borderRadius: 12,
    marginVertical: 20,
    minHeight: 200,
  },
  btn: {
    backgroundColor: AppColors.blue,
    color: 'white',
    borderRadius: 12,
    paddingVertical: 5,
    margin: 5,
  },
  plusButton: {
    padding: 3,
    paddingHorizontal: 7,
    borderWidth: 2,
    borderRadius: 50,
  },

  balanceText: {fontWeight: '900', fontSize: 35},
  boldText: {fontWeight: '700', fontSize: 17},
  greenText: {color: 'green'},

  modelContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  textInput: {borderWidth: 1, padding: 10, width: '100%', borderRadius: 7, marginVertical: 10, borderColor: 'grey'},
  channelListView: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10},
  channelIcon: {width: 25, height: 25},
  channelSideView: {width: '10%'},
  channelMainView: {width: '70%'},
  menuItem: {fontSize: 35, color: 'grey', marginTop: -25, marginLeft: 4},
  fullWidthBtn: {width: '100%'},
  closeButton: {position: 'absolute', right: 10, top: 10},
  leftAlign: {alignSelf: 'flex-start'},
});
