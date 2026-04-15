import { AdvanceGateProvider } from './components/advanceGate'
import { ProductPrototypeApp } from './prototype/ProductPrototypeApp'

export default function App() {
  return (
    <AdvanceGateProvider>
      <ProductPrototypeApp />
    </AdvanceGateProvider>
  )
}
