import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Box,
  ButtonGroup,
  Flex,
  Spacer
} from '@chakra-ui/react';

export function AdvancedGuideModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button colorScheme="blue" onClick={onOpen} size="xs">
        Help
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent p="4">
          <ModalHeader>Guide for Power Users and Traders</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <ol>
              <li>
                <strong>Create Your Vector and Set Up Trading Algorithm Parameters</strong><br />
                First, create a "vector," which is your trading strategy defined in a smart contract. Set the parameters for your trading algorithm, including asset pairs, trading amounts, and specific conditions for executing trades.
              </li><br/>
              <li>
                <strong>Send Tokens to the Vector Source Address</strong><br />
                After setting up your vector, fund it by sending tokens to the designated vector source address. This step ensures your vector has the necessary assets to execute trades according to your strategy.
              </li><br/>
              <li>
                <strong>Vector Destination Address Receives the Exchanged Tokens Based on Your Algorithm</strong><br />
                Your trading algorithm will execute trades based on the parameters you set, and the exchanged tokens will be sent to the vector destination address.
              </li>
            </ol>
            <br/>
            <p><Box fontSize="20px" mb="2"><strong>How DeFi Vectors Work</strong></Box>
            The vectors you create operate inside smart contracts on the Internet Computer. They match with other vectors to execute trades. Every 5 seconds, vectors generate orders with the latest prices and place them in an order book. Orders are then matched based on these prices. The prices for trading pairs like ICP/ckBTC, ckUSDC, and ckETH come from multiple centralized exchanges using the Exchange Rate Canister (XRC) refreshed every 60 seconds, not from Internet Computer decentralized exchange pools.</p>
            <br/>
            <p><Box fontSize="20px" mb="2"><strong>Benefits and Advanced Capabilities</strong></Box>
            <b>Automated and Efficient:</b> Vectors automate the trading process, reducing the need for manual intervention making them ideal for complex trading strategies.<br />
            <b>Low Fees:</b> No trading fees, only minimal ledger transaction fees. Vector creation has a one-time cost of 5 NTN.</p>
            <br/>
            <p><Box fontSize="20px" mb="2"><strong>Use Cases</strong></Box>
            <strong>Accumulation of Tokens (Dollar Cost Averaging)</strong><br />
            Use DeFi Vectors to accumulate tokens securely and systematically over time. Periodically send tokens from a hardware ledger to the vector source address to ensure consistent accumulation without interacting with the trading interface.<br /><br />
            <strong>Tokenization</strong><br />
            Vectors automate token swaps upon receipt, facilitating seamless integration into smart contracts. They can be chained for complex tokenization processes, enhancing liquidity management and supporting diverse trading strategies.</p>
            <br/>
            <p>
                <Box fontSize="20px" mb="2"><strong>Trading Strategy Optimization</strong></Box>
            <b>Maximize Efficiency:</b> Automate your trading operations using DeFi Vectors, reducing manual intervention.<br />
            <b>Leverage Arbitrage:</b> Utilize vectors to exploit arbitrage opportunities between centralized and decentralized exchanges.<br />
            <b>Minimize Risks:</b> Spread trades over time using automated scheduling and splitting, reducing exposure to market volatility and manipulation.<br />
            <b>Optimize Fees:</b> Benefit from minimal transaction fees and no trading fees, making trades more cost-effective.</p>
            <br/>
            <p>By following this guide, power users and traders can effectively utilize DeFi Vectors to enhance their trading strategies, ensuring efficient, secure, and cost-effective trades.</p>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup><a href="https://github.com/Neutrinomic/defivectors/blob/main/README.md" target="_blank"><Button>More</Button></a>
            <Button colorScheme="teal" onClick={onClose}>
              Close
            </Button></ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

