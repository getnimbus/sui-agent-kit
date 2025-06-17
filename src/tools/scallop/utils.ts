import { ScallopQuery, ScallopClient } from "@scallop-io/sui-scallop-sdk";

export class ScallopService {
  private static instance: ScallopService;
  private scallopQuery: ScallopQuery | null = null;
  private scallopClient: ScallopClient | null = null;

  private constructor() {}

  public static getInstance(): ScallopService {
    if (!ScallopService.instance) {
      ScallopService.instance = new ScallopService();
    }
    return ScallopService.instance;
  }

  public async getScallopQuery(): Promise<ScallopQuery> {
    if (!this.scallopQuery) {
      this.scallopQuery = new ScallopQuery({
        addressId: "67c44a103fe1b8c454eb9699",
        networkType: "mainnet",
      });
      await this.scallopQuery.init();
    }
    return this.scallopQuery;
  }

  public async getScallopClient(): Promise<ScallopClient> {
    if (!this.scallopClient) {
      this.scallopClient = new ScallopClient({
        addressId: "67c44a103fe1b8c454eb9699",
        networkType: "mainnet",
      });
      await this.scallopClient.init();
    }
    return this.scallopClient;
  }
}
