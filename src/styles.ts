import {StyleSheet} from 'react-native';

export const AppColors = {blue: '#00bbf9', grey: '#FAFAFA', green: 'green', red: 'red', lightBlue: '#BDEFFF'};
export const borderRadius = 12;

export const styles = StyleSheet.create({
  container: {padding: 10},
  safeArea: {marginBottom: 130},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  img: {width: 30, height: 30, borderRadius: 50},
  responseBox: {
    borderWidth: 4,
    borderColor: AppColors.blue,
    padding: 5,
    backgroundColor: AppColors.lightBlue,
    borderRadius: borderRadius,
    marginVertical: 10,
    minHeight: 140,
    marginHorizontal: 4,
  },
  btn: {
    backgroundColor: AppColors.blue,
    color: 'white',
    borderRadius: borderRadius,
    margin: 5,
    alignItems: 'center',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  smallButton: {
    padding: 3,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: AppColors.blue,
  },

  balanceText: {fontWeight: '900', fontSize: 25, color: AppColors.blue},
  boldText: {fontWeight: '700', fontSize: 15},
  greenText: {color: 'green'},

  modelContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: borderRadius,
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

  textInput: {
    borderWidth: 1,
    padding: 10,
    width: '100%',
    borderRadius: borderRadius,
    marginVertical: 10,
    borderColor: AppColors.blue,
    backgroundColor: AppColors.lightBlue,
  },
  channelListView: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10},
  channelIcon: {width: 25, height: 25},
  channelSideView: {width: '10%'},
  channelMainView: {width: '85%'},
  menuItem: {fontSize: 35, color: 'grey', marginTop: -25, marginLeft: 4},
  fullWidthBtn: {width: '100%'},
  closeButton: {position: 'absolute', right: 10, top: 10},
  leftAlign: {alignSelf: 'flex-start'},

  boxRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginVertical: 1,
  },
  boldNormal: {fontWeight: '700', fontSize: 12},
  channelButton: {marginRight: 20, paddingHorizontal: 20},
});
