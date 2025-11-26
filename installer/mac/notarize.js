// eslint-disable-next-line import/no-unresolved
import { notarize } from '@electron/notarize'

export default async function (context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    appBundleId: 'biz.sakao.markuprev',
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  })
}
