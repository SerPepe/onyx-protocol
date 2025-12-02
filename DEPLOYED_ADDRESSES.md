# USDO Protocol - Deployed Contracts

**Deployment Date**: 2025-12-02  
**Network**: Aztec Sandbox (Local)  
**Deployer**: 0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a

## Contract Addresses

### PriceOracle
- **Address**: `0x14b12fc63d4a2c1285fd1741c9c072c11de8c9633a618bca86e3ba49d9ed3aaf`
- **Initial Price**: 100000000000 (=$100)
- **Owner**: 0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a

### ZToken  
- **Address**: `0x1cf9c77df8f0c2f0d41be8f44bb6f4aa38b79fc5b35ba14eeabb20da1b91c1e9`
- **Initial Supply**: 1,000,000
- **Owner**: 0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a

### USDOToken
- **Address**: `0x0e7f29f49fb27ea8c525c01898856fde82bfa0e2e48305596190b9175259f06e`
- **Owner**: 0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a

### XUsdoToken
- **Address**: `0x111dd0cfb9ba78ca9c0dfc82ed55d8c54e61e5cf6a98fc3c22e23cea2ba88d82`
- **Owner**: 0x2735b31fb4c6dc2f407bc468669a7edb40a580626f06c4c4e1bfacbae4e9d24a

### UsdoVault
- **Address**: `0x1a521853e853a33f907c6c504d7c6a0f0bb0e048ec80c71d22d2dfb4536a0fd0`
- **Oracle**: 0x14b12fc63d4a2c1285fd1741c9c072c11de8c9633a618bca86e3ba49d9ed3aaf
- **USDO Token**: 0x0e7f29f49fb27ea8c525c01898856fde82bfa0e2e48305596190b9175259f06e
- **xUSDO Token**: 0x111dd0cfb9ba78ca9c0dfc82ed55d8c54e61e5cf6a98fc3c22e23cea2ba88d82
- **ZToken**: 0x1cf9c77df8f0c2f0d41be8f44bb6f4aa38b79fc5b35ba14eeabb20da1b91c1e9

## Deployment Status

✅ All contracts deployed successfully  
⚠️ Post-deployment configuration (set_vault) failed due to CLI bug  
⏸️ Vault addresses not yet set in token contracts

## Next Steps

1. Manually call `set_vault` on USDOToken and XUsdoToken
2. Initialize oracle price (if not done)
3. Test contract interactions
4. Verify 3-zone minting logic in UsdoVault
