import VMParent from "../../mvvm/VMParent";


const { ccclass, property } = cc._decorator;

export interface ICombinationItem {
	init(data: CombinationCell): void
	clear(): void;
}

export class CombinationItem extends VMParent implements ICombinationItem {
	public data = null

	init(data: CombinationCell): void {
		this.data = data
	}

	getSize(data: any): cc.Vec2 {
		return;
	}

	getNestScroll() {

	}

	clear(): void {
	}


}

export class CombinationCell {
	public idx = 0
	public posX = 0
	public posY = 0
	public itemData: any = null

	public itemNode: cc.Node | Array<cc.Node> = null

	constructor(idx: number, posX: number, posY: number, data: any ) {
		this.idx = idx
		this.posX = posX
		this.posY = posY
		this.itemData = data
		// for (let i = 0; i < prefabs.length; i++) {
		// 	this.itemNode[i] = cc.instantiate(prefabs[i])

		// }
	}
}

@ccclass
export default class UICombinationItemMgr extends cc.Component {

	@property({
		tooltip: '拆分的item数组',
		type : [cc.Prefab]
	})
	mulItemArray: Array<cc.Prefab> = new Array()

	@property({
		tooltip: '对应拆分的item在夫节点下的zindex',
		type : [cc.Integer]
	})
	mulZIndexArray: Array<number> = new Array()


	private _combinationItemList : Array<CombinationCell> = new Array()

	private _poolList : Array<Array<cc.Node>> = new Array()

	private _content : cc.Node = null

	private _combiantionItemCount : number = 0

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

	}

	public init(content){
		this._content = content
	}

	public clear(){
		this._poolList = []
		this._combinationItemList = []
		this._combiantionItemCount = 0
	}

	public getCombinationItem(idx, posX, posY, data){
		let combinationItem = new CombinationCell(idx, posX, posY, data)
		this._combinationItemList.push(combinationItem)
		return combinationItem
	}

	/**
	 * 获得一个组合的item,先从poolList获取，如果没有则根据mulItemArray记录的item预制生成对应数量的item node设置zindex并返回node数组
	 */
	public getItemNode() : Array<cc.Node>{
		let items = new Array()
		if (this._poolList.length > 0) {
			items = this._poolList.pop()
			for (let i = 0; i < items.length; i++) {
				items[i].active = true
				items[i].opacity = 255
			}
		} else {
			//
			for (let i = 0; i < this.mulItemArray.length; i++) {
				let item = cc.instantiate(this.mulItemArray[i])
				item.parent = this._content
				item.active = true
				item.zIndex = this.mulZIndexArray[i] + this._combiantionItemCount
				items.push(item)
			}
			this._combiantionItemCount ++	
		}
		return items
	}

	public releaseItemNode(itemNodes : Array<cc.Node>) {
		if (itemNodes.length == 0) {
			return
		}
		for (let index = 0; index < itemNodes.length; index++) {
			itemNodes[index].active = false
		}
		this._poolList.push(itemNodes)
	}

	/**
	 * 
	 * @param itemInfo item需要的数据
	 */
	public refreshItems(itemInfo){
		let items = itemInfo.itemNode
		for (let i = 0; i < items.length; i++) {
			items[i].getComponent(CombinationItem).init(itemInfo)
		}
	}

	public clearItems(items : Array<cc.Node>){
		for (let i = 0; i < items.length; i++) {
			items[i].getComponent(CombinationItem).clear()
		}
	}

	// update (dt) {}
}
