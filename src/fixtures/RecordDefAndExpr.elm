module RecordDefAndExpr exposing (..)

type alias R =
    { f1 : String
    , f2 : Int
    , f3 : { f3_f1 : Bool, f3_f2 : List Float }
    }

r =
    { f1 = ""
    , f2 = 1
    , f3 = { f3_f1 = True, f3_f2 = [] }
    }
