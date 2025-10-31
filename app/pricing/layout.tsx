// Layout spécial pour /pricing qui bypass le BetaEndBlocker
// La navigation et le ThemeProvider viennent du layout parent
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
