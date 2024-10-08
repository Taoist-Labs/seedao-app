import styled from 'styled-components';
import BasicModal from 'components/modals/basicModal';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AppActionType, useAuthContext } from 'providers/authProvider';
import { ethers } from 'ethers';
import { builtin } from '@seedao/sns-js';
import ABI from 'assets/abi/SeeDAORegistrarController.json';
import useToast, { ToastType } from 'hooks/useToast';
import getConfig from 'utils/envCofnig';
import { useEthersProvider } from 'hooks/ethersNew';
import { useSendTransaction, Address } from 'wagmi';
import parseError from './parseError';
import { Hex } from "viem";

const networkConfig = getConfig().NETWORK;

const buildSwitchData = (sns: string) => {
  const iface = new ethers.utils.Interface(ABI);
  return iface.encodeFunctionData('setDefaultName', [sns.replace('.seedao', ''), builtin.PUBLIC_RESOLVER_ADDR]);
};

interface IProps {
  select: string;
  handleClose: (newSNS?: string) => void;
}

export default function SwitchModal({ select, handleClose }: IProps) {
  const { t } = useTranslation();
  const {
    state: { account },
    dispatch,
  } = useAuthContext();

  const provider = useEthersProvider({});
  const { sendTransactionAsync } = useSendTransaction();

  const { showToast } = useToast();

  const handleCheckTx = (hash: string) => {
    let timer: any;
    const timerFunc = async () => {
      console.log('check tx hash:', hash);
      provider.getTransactionReceipt(hash).then((r: any) => {
        if (r && r.status === 1) {
          handleClose(select);
          dispatch({ type: AppActionType.SET_SNS, payload: select });
          dispatch({ type: AppActionType.SET_LOADING, payload: false });
        } else if (r && (r.status === 2 || r.status === 0)) {
          dispatch({ type: AppActionType.SET_LOADING, payload: false });
          showToast('transaction failed', ToastType.Danger);
        }
      });
    };
    timer = setInterval(timerFunc, 1500);
  };

  const handleSwitch = async () => {
    dispatch({ type: AppActionType.SET_LOADING, payload: true });
    try {
      const tx = await sendTransactionAsync({
        to: builtin.SEEDAO_REGISTRAR_CONTROLLER_ADDR,
        account: account as Address,
        value: BigInt(0),
        data: buildSwitchData(select) as Hex,
      });
      const txHash = tx.hash;
      handleCheckTx(txHash);
    } catch (error: any) {
      logError(error);
      dispatch({ type: AppActionType.SET_LOADING, payload: false });
      showToast(parseError(error), ToastType.Danger);
    }
  };
  return (
    <SwitchModalStyle handleClose={handleClose}>
      <SelectSNS>{select}</SelectSNS>
      <Content>
        <img src={networkConfig.icon} alt="" />
        <span>{account}</span>
      </Content>
      <Footer>
        <Button variant="outline-primary" onClick={() => handleClose()} style={{ width: '110px' }}>
          {t('general.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSwitch} style={{ width: '110px' }}>
          {t('general.confirm')}
        </Button>
      </Footer>
    </SwitchModalStyle>
  );
}

const SwitchModalStyle = styled(BasicModal)`
  width: 494px;
  padding-top: 65px;
  text-align: center;
`;

const SelectSNS = styled.div`
  color: var(--bs-primary);
  font-family: 'Poppins-Medium';
  font-weight: 500;
  line-height: 28px;
  font-size: 24px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 77px;
  button.btn {
    margin-right: 0;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 14px;
  color: var(--bs-body-color_active);
  margin-top: 40px;
  img {
    width: 24px;
  }
`;
